import { AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getStoredRoles, login } from './index';

import { api } from '../api';

const adminAccessToken =
  'eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJibG9nLWpvc2lrLWNvbGxlY3RvciIsImlhdCI6MTc4NTY3NzY2OCwiZXhwIjoxNzg1Njg0ODY4LCJhdXRoZW50aWNhdGlvbklkIjoiMDgxOWJkZWUtZjcyZS00YjBmLWFiM2EtYzVmZDU2ZjBiMzcxIiwidXNlcklkIjoiNzEwZTE4YjItZGM4ZS00NDJlLTg0ZjgtYWMxYzMwMDFiMWFlIiwibmlja25hbWUiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl19.Oy-2hzXGZdEAthFQ1fW5OPEssiAhEz6zr7Epdi_REBG7Ymq4lsDPo5kOEZ2R0vprwQHvOiJnvodDOaz1vi3keQ';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('getStoredRoles', () => {
  it('reads roles from the stored access token without duplicating the payload', () => {
    localStorage.setItem('accessToken', adminAccessToken);
    localStorage.setItem('roles', '["USER"]');

    expect(getStoredRoles()).toEqual(['ADMIN']);
    expect(localStorage.getItem('roles')).toBeNull();
  });
});

describe('login', () => {
  it('maps the access token payload to an AccessTokenEntity', async () => {
    vi.spyOn(api, 'post').mockResolvedValue({
      config: { headers: new AxiosHeaders() },
      data: {
        access_token: adminAccessToken,
        refresh_token: 'refresh-token',
      },
      headers: {},
      status: 200,
      statusText: 'OK',
    });

    const result = await login({ login_id: 'admin', password: 'password' });

    expect(result.accessTokenEntity).toEqual({
      authenticationId: '0819bdee-f72e-4b0f-ab3a-c5fd56f0b371',
      exp: 1785684868,
      iat: 1785677668,
      iss: 'blog-josik-collector',
      nickname: 'admin',
      roles: ['ADMIN'],
      userId: '710e18b2-dc8e-442e-84f8-ac1c3001b1ae',
    });
  });
});
