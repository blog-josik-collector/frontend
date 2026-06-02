import { http, HttpResponse } from 'msw';

import { faker } from '@faker-js/faker';

interface CommentItem {
  id: string;
  user_id: string;
  post_id: string;
  parent_id?: string;
  parent_comment_id?: string;
  has_child_comment: boolean;
  content: string;
  status?: string;
  created_at: number;
  updated_at: number;
}

const now = Date.now();
const myComments: CommentItem[] = Array.from({ length: 36 }, (_, index) => ({
  id: `my-comment-${index + 1}`,
  user_id: 'me',
  post_id: `posting-${(index % 12) + 1}`,
  has_child_comment: faker.datatype.boolean(),
  content: faker.lorem.sentence({ min: 5, max: 14 }),
  status: 'OPEN',
  created_at: now - index * 86_400_000,
  updated_at: now - index * 43_200_000,
}));

const repliesByCommentId = new Map<string, CommentItem[]>();

const getReplies = (commentId: string) => {
  const existing = repliesByCommentId.get(commentId);
  if (existing) return existing;

  const replies = Array.from({ length: faker.number.int({ min: 3, max: 14 }) }, (_, index) => ({
    id: `${commentId}-reply-${index + 1}`,
    user_id: faker.internet.username(),
    post_id: `posting-${(index % 12) + 1}`,
    parent_id: commentId,
    parent_comment_id: commentId,
    has_child_comment: false,
    content: faker.lorem.sentence({ min: 4, max: 12 }),
    status: 'OPEN',
    created_at: now - index * 3_600_000,
    updated_at: now - index * 1_800_000,
  }));

  repliesByCommentId.set(commentId, replies);
  return replies;
};

export const commentHandlers = [
  http.patch('/api/v1/comments/:commentId', async ({ request, params }) => {
    const body = (await request.json()) as { content?: string };
    const updatedAt = Date.now();
    const comment = myComments.find((item) => item.id === params.commentId);

    if (comment && body.content) {
      comment.content = body.content;
      comment.updated_at = updatedAt;
    }

    return HttpResponse.json({
      id: params.commentId,
      updated_at: updatedAt,
    });
  }),

  http.delete('/api/v1/comments/:commentId', () => new HttpResponse(null, { status: 202 })),

  http.post('/api/v1/comments/:commentId/replies', async ({ request, params }) => {
    const body = (await request.json()) as { content?: string };
    const createdAt = Date.now();
    const commentId = params.commentId as string;
    const reply = {
      id: faker.string.uuid(),
      parent_id: commentId,
      parent_comment_id: commentId,
      user_id: 'me',
      post_id: `posting-${faker.number.int({ min: 1, max: 12 })}`,
      has_child_comment: false,
      content: body.content ?? '',
      status: 'OPEN',
      created_at: createdAt,
      updated_at: createdAt,
    };

    repliesByCommentId.set(commentId, [reply, ...getReplies(commentId)]);

    return HttpResponse.json(
      {
        id: reply.id,
        parent_id: commentId,
        created_at: createdAt,
      },
      { status: 201 },
    );
  }),

  http.get('/api/v1/comments/:commentId/replies', ({ request, params }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const replies = getReplies(params.commentId as string);
    const startIndex = page * size;

    return HttpResponse.json({
      total_count: replies.length,
      items: replies.slice(startIndex, startIndex + size),
    });
  }),

  http.patch('/api/v1/replies/:replyId', async ({ request, params }) => {
    const body = (await request.json()) as { content?: string };
    const updatedAt = Date.now();

    Array.from(repliesByCommentId.values())
      .flat()
      .forEach((reply) => {
        if (reply.id === params.replyId && body.content) {
          reply.content = body.content;
          reply.updated_at = updatedAt;
        }
      });

    return HttpResponse.json({
      id: params.replyId,
      updated_at: updatedAt,
    });
  }),

  http.delete('/api/v1/replies/:replyId', () => new HttpResponse(null, { status: 202 })),

  http.get('/api/v1/me/comments', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const startIndex = page * size;

    return HttpResponse.json({
      total_count: myComments.length,
      items: myComments.slice(startIndex, startIndex + size),
    });
  }),
];
