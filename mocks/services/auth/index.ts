import { http, HttpResponse } from 'msw';

import { faker } from '@faker-js/faker';

const dummyAccessToken =
  'eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJibG9nLWpvc2lrLWNvbGxlY3RvciIsImlhdCI6MTc4NTY3NzY2OCwiZXhwIjoxNzg1Njg0ODY4LCJhdXRoZW50aWNhdGlvbklkIjoiMDgxOWJkZWUtZjcyZS00YjBmLWFiM2EtYzVmZDU2ZjBiMzcxIiwidXNlcklkIjoiNzEwZTE4YjItZGM4ZS00NDJlLTg0ZjgtYWMxYzMwMDFiMWFlIiwibmlja25hbWUiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl19.Oy-2hzXGZdEAthFQ1fW5OPEssiAhEz6zr7Epdi_REBG7Ymq4lsDPo5kOEZ2R0vprwQHvOiJnvodDOaz1vi3keQ';

export const authHandlers = [
  http.post('/auth/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { login_id?: string; password?: string };

    if (!body.login_id || !body.password) {
      return HttpResponse.json({ message: 'login_id and password are required' }, { status: 400 });
    }

    return HttpResponse.json({
      access_token: dummyAccessToken,
      refresh_token: `mock-refresh-${faker.string.uuid()}`,
    });
  }),
];
