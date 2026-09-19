import { setupServer } from 'msw/node';
import { afterEach, expect, it, vi } from 'vitest';

const server = setupServer();

afterEach(() => {
  server.close();
  server.resetHandlers();
  vi.unstubAllEnvs();
  vi.resetModules();
});

it.each(['', '/', '/api', '/api/', 'https://api.example.test/api/'])(
  'matches client requests with API base URL %j',
  async (baseURL) => {
    vi.stubEnv('VITE_API_BASE_URL', baseURL);
    vi.resetModules();
    const { handlers } = await import('./handlers');
    const { apiClient } = await import('../src/services/api');
    server.use(...handlers);
    server.listen({ onUnhandledRequest: 'error' });

    const response = await apiClient.get('/user/v1/users/me');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('login_id');

    const prefix = baseURL.replace(/\/+$/, '');
    expect(handlers.every((handler) => String(handler.info.path).startsWith(`${prefix}/`))).toBe(
      true,
    );
  },
  20000,
);
