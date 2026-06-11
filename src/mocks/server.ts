/**
 * MSW Node.js 테스트 서버
 *
 * API 연동이 필요한 테스트 파일에서 아래 패턴으로 사용합니다:
 *
 * ```ts
 * import { server } from '@/mocks/server';
 *
 * beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 *
 * 특정 테스트에서 핸들러를 오버라이드하려면:
 * ```ts
 * server.use(http.get('/api/foo', () => HttpResponse.json({ ok: true })));
 * ```
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
