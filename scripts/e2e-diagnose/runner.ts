/**
 * E2E 진단 러너
 *
 * 사용법:
 *   npm run e2e:diagnose              # 전체 시나리오
 *   npm run e2e:diagnose:auth         # 인증 시나리오
 *   npm run e2e:diagnose:api          # API 연동 시나리오
 *
 * 환경 변수: .env.e2e 파일 참조
 */

import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCENARIO = process.env.E2E_SCENARIO ?? 'all';
const TARGET_URL = process.env.E2E_TARGET_URL ?? 'https://ssac.io';
const OUTPUT_DIR = path.join(process.cwd(), 'scripts/e2e-diagnose/output');

interface DiagnosticReport {
  scenario: string;
  timestamp: string;
  targetUrl: string;
  consoleLogs: ConsoleEntry[];
  networkRequests: NetworkEntry[];
  storageState: StorageState;
  authPatterns: AuthPatternResult;
}

interface ConsoleEntry {
  type: string;
  text: string;
  timestamp: number;
}

interface NetworkEntry {
  url: string;
  method: string;
  status: number | null;
  resourceType: string;
  timestamp: number;
}

interface StorageState {
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  cookies: Array<{ name: string; value: string; domain: string }>;
}

interface AuthPatternResult {
  reissueAttempted: boolean;
  auth011Detected: boolean;
  auth012Detected: boolean;
  clearAuthStateDetected: boolean;
  corsErrorDetected: boolean;
  onboardingAnswersExist: boolean;
}

function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

async function collectStorageState(page: Page): Promise<StorageState> {
  const [localStorage, sessionStorage] = await page.evaluate(() => {
    const local: Record<string, string> = {};
    const session: Record<string, string> = {};

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) local[key] = window.localStorage.getItem(key) ?? '';
    }
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (key) session[key] = window.sessionStorage.getItem(key) ?? '';
    }

    return [local, session];
  });

  const context = page.context();
  const cookies = await context.cookies();

  return {
    localStorage,
    sessionStorage,
    cookies: cookies.map((c) => ({ name: c.name, value: c.value, domain: c.domain })),
  };
}

function analyzeAuthPatterns(logs: ConsoleEntry[]): AuthPatternResult {
  const texts = logs.map((l) => l.text);
  return {
    reissueAttempted: texts.some((t) => t.includes('reissue')),
    auth011Detected: texts.some((t) => t.includes('AUTH-011')),
    auth012Detected: texts.some((t) => t.includes('AUTH-012')),
    clearAuthStateDetected: texts.some((t) => t.includes('clearAuthState')),
    corsErrorDetected: texts.some((t) => t.includes('CORS')),
    onboardingAnswersExist: false, // sessionStorage 분석 후 덮어씀
  };
}

async function runAuthScenario(page: Page): Promise<void> {
  console.log('[e2e:diagnose] auth 시나리오 실행 중...');
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
}

async function runApiScenario(page: Page): Promise<void> {
  console.log('[e2e:diagnose] api 시나리오 실행 중...');
  await page.goto(`${TARGET_URL}/home`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
}

async function runAllScenarios(page: Page): Promise<void> {
  await runAuthScenario(page);
  await runApiScenario(page);
}

async function main(): Promise<void> {
  ensureOutputDir();

  const consoleLogs: ConsoleEntry[] = [];
  const networkRequests: NetworkEntry[] = [];

  const browser: Browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext({
    extraHTTPHeaders: { 'Accept-Language': 'ko-KR' },
  });
  const page: Page = await context.newPage();

  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text(), timestamp: Date.now() });
  });

  page.on('request', (req) => {
    networkRequests.push({
      url: req.url(),
      method: req.method(),
      status: null,
      resourceType: req.resourceType(),
      timestamp: Date.now(),
    });
  });

  page.on('response', (res) => {
    const entry = networkRequests.find((r) => r.url === res.url() && r.status === null);
    if (entry) entry.status = res.status();
  });

  try {
    switch (SCENARIO) {
      case 'auth':
        await runAuthScenario(page);
        break;
      case 'api':
        await runApiScenario(page);
        break;
      default:
        await runAllScenarios(page);
    }

    const storageState = await collectStorageState(page);
    const authPatterns = analyzeAuthPatterns(consoleLogs);
    authPatterns.onboardingAnswersExist = 'onboarding_answers' in storageState.sessionStorage;

    const report: DiagnosticReport = {
      scenario: SCENARIO,
      timestamp: new Date().toISOString(),
      targetUrl: TARGET_URL,
      consoleLogs,
      networkRequests,
      storageState,
      authPatterns,
    };

    const reportPath = path.join(OUTPUT_DIR, `report-${SCENARIO}-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`[e2e:diagnose] 진단 완료 → ${reportPath}`);
    printSummary(report);
  } finally {
    await browser.close();
  }
}

function printSummary(report: DiagnosticReport): void {
  console.log('\n=== E2E 진단 요약 ===');
  console.log(`시나리오: ${report.scenario}`);
  console.log(`대상 URL: ${report.targetUrl}`);
  console.log(`콘솔 로그: ${report.consoleLogs.length}건`);
  console.log(`네트워크 요청: ${report.networkRequests.length}건`);
  console.log('\n--- Axios Interceptor 패턴 ---');
  console.log(`reissue 시도: ${report.authPatterns.reissueAttempted ? '✅' : '❌'}`);
  console.log(`AUTH-011 감지: ${report.authPatterns.auth011Detected ? '✅' : '❌'}`);
  console.log(`AUTH-012 감지: ${report.authPatterns.auth012Detected ? '✅' : '❌'}`);
  console.log(`clearAuthState 감지: ${report.authPatterns.clearAuthStateDetected ? '✅' : '❌'}`);
  console.log(`CORS 오류: ${report.authPatterns.corsErrorDetected ? '⚠️' : '❌'}`);
  console.log('\n--- SessionStorage ---');
  console.log(
    `onboarding_answers: ${report.authPatterns.onboardingAnswersExist ? '✅ 존재 (비로그인 온보딩 완료)' : '❌ 없음'}`,
  );
}

main().catch((err) => {
  console.error('[e2e:diagnose] 오류:', err);
  process.exit(1);
});
