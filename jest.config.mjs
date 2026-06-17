import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/api-contract/(.*)$': '<rootDir>/api-contract/$1',
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/app/**', '!src/mocks/**'],

  // 커버리지 임계값 — testing.md 기준: 컴포넌트 70% / 훅 80% / 유틸 90%
  // 현재 전체 커버리지 0.39% (기존 코드 미테스트) → global 임계값 미설정
  // 테스트 작성 완료 파일에만 회귀 방지 임계값 적용, 신규 테스트 파일 추가 시 여기에 추가
  coverageThreshold: {
    './src/lib/utils.ts': {
      lines: 50,
      functions: 45,
      branches: 45,
      statements: 50,
    },
  },
};

export default createJestConfig(config);
