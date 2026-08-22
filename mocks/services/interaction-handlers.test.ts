import { setupServer } from 'msw/node';
import { afterAll, beforeAll, expect, it } from 'vitest';

import { commentHandlers } from './comment';
import { postingsHandlers } from './posting';
import { reportHandlers } from './report';
import { userHandlers } from './user';

const server = setupServer(
  ...commentHandlers,
  ...postingsHandlers,
  ...reportHandlers,
  ...userHandlers,
);
const mockOrigin = window.location.origin;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

it('registers interaction mocks at the same service prefix used by the client', () => {
  const paths = [...commentHandlers, ...reportHandlers].map((handler) => handler.info.path);

  expect(paths.every((path) => String(path).startsWith('/interaction/v1/'))).toBe(true);
});

it('returns current admin report DTO fields', async () => {
  const postingResponse = await fetch(`${mockOrigin}/interaction/v1/admin/reports/postings`);
  const commentResponse = await fetch(`${mockOrigin}/interaction/v1/admin/reports/comments`);
  const postingBody = await postingResponse.json();
  const commentBody = await commentResponse.json();

  expect(postingBody.items[0]).toMatchObject({
    nickname: expect.any(String),
    title: expect.any(String),
  });
  expect(postingBody.items[0]).not.toHaveProperty('reporter_id');
  expect(postingBody.items[0]).not.toHaveProperty('post_id');
  expect(commentBody.items[0]).toMatchObject({
    nickname: expect.any(String),
    comment_content: expect.any(String),
  });
  expect(commentBody.items[0]).not.toHaveProperty('reporter_id');
  expect(commentBody.items[0]).not.toHaveProperty('comment_id');
});

it('returns nickname in posting, reply, and my-comment DTOs', async () => {
  await fetch(`${mockOrigin}/interaction/v1/postings/posting-1/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Mock comment' }),
  });

  const postingResponse = await fetch(`${mockOrigin}/interaction/v1/postings/posting-1/comments`);
  const replyResponse = await fetch(`${mockOrigin}/interaction/v1/comments/comment-1/replies`);
  const myCommentResponse = await fetch(`${mockOrigin}/interaction/v1/me/comments`);
  const postingBody = await postingResponse.json();
  const replyBody = await replyResponse.json();
  const myCommentBody = await myCommentResponse.json();

  for (const item of [postingBody.items[0], replyBody.items[0], myCommentBody.items[0]]) {
    expect(item).toHaveProperty('nickname', expect.any(String));
    expect(item).not.toHaveProperty('user_id');
  }
});

it('returns login_id in the current-user DTO', async () => {
  const response = await fetch(`${mockOrigin}/user/v1/users/me`);
  const body = await response.json();

  expect(body).toHaveProperty('login_id', expect.any(String));
});
