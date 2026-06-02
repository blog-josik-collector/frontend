import { http, HttpResponse } from 'msw';

import { faker } from '@faker-js/faker';

export const authHandlers = [
  http.post('/auth/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { login_id?: string; password?: string };

    if (!body.login_id || !body.password) {
      return HttpResponse.json({ message: 'login_id and password are required' }, { status: 400 });
    }

    return HttpResponse.json({
      access_token: `mock-access-${faker.string.uuid()}`,
      refresh_token: `mock-refresh-${faker.string.uuid()}`,
    });
  }),
];
