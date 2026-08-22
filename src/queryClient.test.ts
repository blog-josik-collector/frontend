import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppQueryClient } from './queryClient';

afterEach(() => {
  vi.useRealTimers();
});

describe('app query policy', () => {
  it('retries a failed server request at most twice', async () => {
    const queryClient = createAppQueryClient();
    const queryFn = vi.fn().mockRejectedValue(new Error('server unavailable'));

    await expect(
      queryClient.fetchQuery({ queryKey: ['retry-server-error'], queryFn, retryDelay: 0 }),
    ).rejects.toThrow('server unavailable');

    expect(queryFn).toHaveBeenCalledTimes(3);
  });

  it('does not retry a client error', async () => {
    const queryClient = createAppQueryClient();
    const queryFn = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { status: 400 },
    });

    await expect(
      queryClient.fetchQuery({ queryKey: ['no-retry-client-error'], queryFn, retryDelay: 0 }),
    ).rejects.toMatchObject({ response: { status: 400 } });

    expect(queryFn).toHaveBeenCalledOnce();
  });

  it('reuses successful data for one minute and refetches after it becomes stale', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-23T00:00:00Z'));
    const queryClient = createAppQueryClient();
    const queryFn = vi.fn().mockResolvedValue('result');
    const query = { queryKey: ['one-minute-cache'], queryFn } as const;

    await queryClient.fetchQuery(query);
    await queryClient.fetchQuery(query);

    expect(queryFn).toHaveBeenCalledOnce();

    vi.setSystemTime(new Date('2026-08-23T00:01:00.001Z'));
    await queryClient.fetchQuery(query);

    expect(queryFn).toHaveBeenCalledTimes(2);
  });
});
