import { http, HttpResponse } from 'msw';

import { faker } from '@faker-js/faker';

const me = {
  user_id: 'user-me',
  user_type: 'USER',
  login_type: 'DIRECT',
  nickname: 'mock-user',
  introduction: 'MSW mock user',
  created_at: new Date(Date.now() - 30 * 86_400_000).toISOString(),
  updated_at: new Date().toISOString(),
  last_login_at: new Date().toISOString(),
};

export const userHandlers = [
  http.post('/user/v1/users', async ({ request }) => {
    const body = (await request.json()) as { nickname?: string };
    const createdAt = new Date().toISOString();

    if (body.nickname) {
      me.nickname = body.nickname;
      me.created_at = createdAt;
      me.updated_at = createdAt;
    }

    return HttpResponse.json(
      {
        user_id: faker.string.uuid(),
        created_at: createdAt,
      },
      { status: 201 },
    );
  }),

  http.get('/user/v1/users/me', () => HttpResponse.json(me)),

  http.patch('/user/v1/users/me', async ({ request }) => {
    const body = (await request.json()) as { nickname?: string };
    const updatedAt = new Date().toISOString();

    if (body.nickname) {
      me.nickname = body.nickname;
    }
    me.updated_at = updatedAt;

    return HttpResponse.json({
      user_id: me.user_id,
      updated_at: updatedAt,
    });
  }),

  http.patch('/user/v1/users/me/password', () =>
    HttpResponse.json({
      user_id: me.user_id,
      updated_at: new Date().toISOString(),
    }),
  ),

  http.post('/user/v1/users/me/merge-oauth', () => new HttpResponse(null, { status: 202 })),

  http.delete('/user/v1/users/me', () => new HttpResponse(null, { status: 202 })),
];
