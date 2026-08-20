import type { PropsWithChildren } from 'react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook } from '@testing-library/react';

import { useDeleteMe } from './meStore';

const deleteMeMock = vi.fn();

vi.mock('@/services/user', () => ({
  deleteMe: (...args: unknown[]) => deleteMeMock(...args),
  getMe: vi.fn(),
  mergeOAuth: vi.fn(),
  signUp: vi.fn(),
  updateMe: vi.fn(),
  updateMyPassword: vi.fn(),
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
  deleteMeMock.mockReset();
});

afterEach(cleanup);

describe('useDeleteMe', () => {
  it('clears all stored authentication data after account deletion', async () => {
    deleteMeMock.mockResolvedValue(undefined);
    localStorage.setItem('accessToken', 'access-token');
    localStorage.setItem('refreshToken', 'refresh-token');
    localStorage.setItem('roles', '["USER"]');
    const { result } = renderHook(() => useDeleteMe(), { wrapper: createWrapper() });

    await act(() => result.current.mutateAsync());

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('roles')).toBeNull();
  });
});
