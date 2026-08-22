import { AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getMe, signUp, updateMyPassword } from './index';

import { api } from '../api';

const axiosResponse = <T>(data: T) => ({
  config: { headers: new AxiosHeaders() },
  data,
  headers: {},
  status: 200,
  statusText: 'OK',
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('user OpenAPI contract', () => {
  it('maps the current user response without removed profile fields', async () => {
    vi.spyOn(api, 'get').mockResolvedValue(
      axiosResponse({
        created_at: '2026-08-22T00:00:00Z',
        last_login_at: '2026-08-22T01:00:00Z',
        nickname: 'tester',
        updated_at: '2026-08-22T00:30:00Z',
        user_id: 'user-1',
        user_type: 'USER',
      }),
    );

    const result = await getMe();

    expect(result).toEqual({
      createdAt: Date.parse('2026-08-22T00:00:00Z'),
      lastLoginAt: Date.parse('2026-08-22T01:00:00Z'),
      nickname: 'tester',
      updatedAt: Date.parse('2026-08-22T00:30:00Z'),
      userId: 'user-1',
      userType: 'USER',
    });
    expect(result).not.toHaveProperty('loginType');
    expect(result).not.toHaveProperty('introduction');
  });

  it('sends signup without the removed introduction field', async () => {
    const post = vi
      .spyOn(api, 'post')
      .mockResolvedValue(axiosResponse({ created_at: '2026-08-22T00:00:00Z', user_id: 'user-1' }));
    const body = {
      login_id: 'tester@example.com',
      nickname: 'tester',
      password: 'encoded',
      password_confirm: 'encoded',
    };

    await signUp(body);

    expect(post).toHaveBeenCalledWith('/user/v1/users', body);
  });

  it('sends only current and new passwords after local confirmation', async () => {
    const patch = vi
      .spyOn(api, 'patch')
      .mockResolvedValue(axiosResponse({ updated_at: '2026-08-22T00:00:00Z', user_id: 'user-1' }));
    const body = { new_password: 'new-encoded', password: 'current-encoded' };

    await updateMyPassword(body);

    expect(patch).toHaveBeenCalledWith('/user/v1/users/me/password', body);
  });
});
