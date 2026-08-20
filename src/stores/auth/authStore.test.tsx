import type { PropsWithChildren } from 'react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook } from '@testing-library/react';

import { useLogin, useLogout } from './authStore';

const loginMock = vi.fn();

vi.mock('@/services/auth', () => ({
  login: (...args: unknown[]) => loginMock(...args),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

beforeEach(() => {
  localStorage.clear();
  loginMock.mockReset();
});

afterEach(cleanup);

describe('useLogin', () => {
  it('stores only the issued tokens', async () => {
    loginMock.mockResolvedValue({
      accessToken: 'access-token',
      accessTokenEntity: null,
      refreshToken: 'refresh-token',
    });
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    await act(() => result.current.mutateAsync({ login_id: 'admin', password: 'password' }));

    expect(localStorage.getItem('accessToken')).toBe('access-token');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    expect(localStorage.getItem('roles')).toBeNull();
  });
});

describe('useLogout', () => {
  it('removes stored roles with the tokens', async () => {
    localStorage.setItem('accessToken', 'access-token');
    localStorage.setItem('refreshToken', 'refresh-token');
    localStorage.setItem('roles', '["ADMIN"]');
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

    await act(() => result.current.mutateAsync());

    expect(localStorage.getItem('roles')).toBeNull();
  });
});
