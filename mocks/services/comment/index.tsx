import { http, HttpResponse } from 'msw';

import { faker } from '@faker-js/faker';

import type { MyCommentDto } from '@/services/comment/me';

type CommentItem = MyCommentDto;

const now = Date.now();
const myComments: CommentItem[] = Array.from({ length: 36 }, (_, index) => ({
  id: `my-comment-${index + 1}`,
  nickname: 'mock-user',
  has_child_comment: faker.datatype.boolean(),
  content: faker.lorem.sentence({ min: 5, max: 14 }),
  status: 'active',
  created_at: new Date(now - index * 86_400_000).toISOString(),
  updated_at: new Date(now - index * 43_200_000).toISOString(),
}));

const repliesByCommentId = new Map<string, CommentItem[]>();

const getReplies = (commentId: string) => {
  const existing = repliesByCommentId.get(commentId);
  if (existing) return existing;

  const replies = Array.from({ length: faker.number.int({ min: 3, max: 14 }) }, (_, index) => ({
    id: `${commentId}-reply-${index + 1}`,
    nickname: faker.internet.username(),
    has_child_comment: false,
    content: faker.lorem.sentence({ min: 4, max: 12 }),
    status: 'active' as const,
    created_at: new Date(now - index * 3_600_000).toISOString(),
    updated_at: new Date(now - index * 1_800_000).toISOString(),
  }));

  repliesByCommentId.set(commentId, replies);
  return replies;
};

export const commentHandlers = [
  http.patch('/interaction/v1/comments/:commentId', async ({ request, params }) => {
    const body = (await request.json()) as { content?: string };
    const updatedAt = new Date().toISOString();
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

  http.delete('/interaction/v1/comments/:commentId', () => new HttpResponse(null, { status: 202 })),

  http.post('/interaction/v1/comments/:commentId/replies', async ({ request, params }) => {
    const body = (await request.json()) as { content?: string };
    const createdAt = new Date().toISOString();
    const commentId = params.commentId as string;
    const reply = {
      id: faker.string.uuid(),
      nickname: 'mock-user',
      has_child_comment: false as const,
      content: body.content ?? '',
      status: 'active' as const,
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

  http.get('/interaction/v1/comments/:commentId/replies', ({ request, params }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const replies = getReplies(params.commentId as string);
    const startIndex = page * size;

    return HttpResponse.json({
      total_count: replies.length,
      page,
      size,
      items: replies.slice(startIndex, startIndex + size),
    });
  }),

  http.patch('/interaction/v1/replies/:replyId', async ({ request, params }) => {
    const body = (await request.json()) as { content?: string };
    const updatedAt = new Date().toISOString();

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

  http.delete('/interaction/v1/replies/:replyId', () => new HttpResponse(null, { status: 202 })),

  http.get('/interaction/v1/me/comments', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const startIndex = page * size;

    return HttpResponse.json({
      total_count: myComments.length,
      page,
      size,
      items: myComments.slice(startIndex, startIndex + size),
    });
  }),
];
