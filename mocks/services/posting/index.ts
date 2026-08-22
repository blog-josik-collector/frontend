import { http, HttpResponse } from 'msw';

import { faker } from '@faker-js/faker';

import type { PostingDetailDto, PostingListItemDto } from '@/services/posting';

interface PostingCommentItem {
  id: string;
  user_id: string;
  parent_comment_id: string;
  has_child_comment: boolean;
  content: string;
  status: 'active' | 'blocked' | 'deleted';
  created_at: string;
  updated_at: string;
}

// Mock 데이터 생성 함수
const generateMockPostings = (count: number): PostingListItemDto[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `posting-${index + 1}`,
    provider: `provider-${(index % 3) + 1}`,
    title: faker.lorem.sentence({ min: 4, max: 8 }),
    published_at: faker.date.recent({ days: 120 }).toISOString(),
    thumbnail_url: `https://picsum.photos/seed/${faker.string.uuid()}/300/200`,
    summary: faker.lorem.paragraphs({ min: 1, max: 2 }),
    status: faker.helpers.arrayElement(['active', 'blocked', 'deleted'] as const),
    like_count: faker.number.int({ min: 0, max: 1000 }),
    view_count: faker.number.int({ min: 0, max: 10000 }),
    likes_of_me: faker.datatype.boolean(),
    bookmarks_of_me: faker.datatype.boolean(),
    comment_count: faker.number.int({ min: 0, max: 100 }),
    total_report_count: faker.number.int({ min: 0, max: 5 }),
    url: `https://example.com/postings/posting-${index + 1}`,
    created_at: faker.date.past({ years: 1 }).toISOString(),
    updated_at: faker.date.recent({ days: 30 }).toISOString(),
  }));
};

// Mock 게시물 데이터 생성
const mockPostingsData = generateMockPostings(110);
const likedPostings = new Set<string>(
  mockPostingsData.filter((post) => post.likes_of_me).map((post) => post.id),
);
const bookmarkMap = new Map<string, number>(
  mockPostingsData
    .filter((post) => post.bookmarks_of_me)
    .map((post, index) => [post.id, Date.now() - index * 60_000]),
);
const mockCommentsByPostId = new Map<string, PostingCommentItem[]>();

const isReplyInThread = (
  comment: PostingCommentItem,
  rootCommentId: string,
  comments: PostingCommentItem[],
): boolean => {
  let currentParentId = comment.parent_comment_id;

  while (currentParentId) {
    if (currentParentId === rootCommentId) {
      return true;
    }

    const parentComment = comments.find((item) => item.id === currentParentId);
    if (!parentComment) {
      return false;
    }

    currentParentId = parentComment.parent_comment_id;
  }

  return false;
};

const getRootComments = (comments: PostingCommentItem[]) =>
  comments.filter((comment) => !comment.parent_comment_id);

const getThreadReplies = (comments: PostingCommentItem[], rootCommentId: string) =>
  comments.filter((comment) => isReplyInThread(comment, rootCommentId, comments));

const toPostingCommentResponse = (comment: PostingCommentItem) => ({
  content: comment.content,
  created_at: comment.created_at,
  has_child_comment: comment.has_child_comment,
  id: comment.id,
  status: comment.status,
  updated_at: comment.updated_at,
  user_id: comment.user_id,
});

// 게시물 상세 데이터 생성 함수
const generateMockPostingDetail = (postingId: string): PostingDetailDto => {
  const basePosting = mockPostingsData.find((p) => p.id === postingId);
  if (!basePosting) {
    // 존재하지 않는 ID인 경우도 생성
    const index = parseInt(postingId.split('-')[1]) || 1;
    return {
      id: postingId,
      provider: `provider-${(index % 3) + 1}`,
      title: faker.lorem.sentence({ min: 4, max: 8 }),
      published_at: faker.date.recent({ days: 120 }).toISOString(),
      thumbnail_url: `https://picsum.photos/seed/${faker.string.uuid()}/300/200`,
      summary: faker.lorem.paragraphs({ min: 1, max: 2 }),
      status: faker.helpers.arrayElement(['active', 'blocked', 'deleted'] as const),
      like_count: faker.number.int({ min: 0, max: 1000 }),
      view_count: faker.number.int({ min: 0, max: 10000 }),
      likes_of_me: faker.datatype.boolean(),
      bookmarks_of_me: faker.datatype.boolean(),
      comment_count: faker.number.int({ min: 0, max: 100 }),
      total_report_count: faker.number.int({ min: 0, max: 5 }),
      url: `https://example.com/postings/${postingId}`,
      created_at: faker.date.past({ years: 1 }).toISOString(),
      updated_at: faker.date.recent({ days: 30 }).toISOString(),
    };
  }

  return {
    ...basePosting,
    likes_of_me: likedPostings.has(postingId),
    bookmarks_of_me: bookmarkMap.has(postingId),
    url: `https://example.com/postings/${postingId}`,
    created_at: basePosting.published_at,
    updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
};

// GET /api/v1/postings 핸들러
export const postingsHandlers = [
  http.get('/interaction/v1/postings', ({ request }) => {
    console.log('mocking!!');
    const url = new URL(request.url);

    // 쿼리 파라미터 파싱
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const provider = url.searchParams.get('provider');
    const title = url.searchParams.get('title');

    // Mock 데이터 생성
    let allPostings = mockPostingsData;

    // 필터링
    if (provider) {
      allPostings = allPostings.filter((posting) => posting.provider === provider);
    }

    if (title) {
      allPostings = allPostings.filter((posting) =>
        posting.title.toLowerCase().includes(title.toLowerCase()),
      );
    }

    // 페이징
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedPostings = allPostings.slice(startIndex, endIndex);

    const response = {
      total_count: allPostings.length,
      page,
      size,
      items: paginatedPostings,
    };

    return HttpResponse.json(response);
  }),

  // GET /api/v1/postings/:id 핸들러
  http.get('/interaction/v1/postings/:id', ({ params }) => {
    const { id } = params;
    const postingDetail = generateMockPostingDetail(id as string);
    return HttpResponse.json(postingDetail);
  }),

  // POST /api/v1/postings/:id/likes 핸들러
  http.post('/interaction/v1/postings/:id/likes', ({ params }) => {
    const { id } = params;
    const postingId = id as string;
    const basePosting = mockPostingsData.find((post) => post.id === postingId);

    if (basePosting && !likedPostings.has(postingId)) {
      basePosting.like_count += 1;
    }
    if (basePosting) {
      basePosting.likes_of_me = true;
    }
    likedPostings.add(postingId);

    return HttpResponse.json({}, { status: 202 });
  }),

  // DELETE /api/v1/postings/:id/likes 핸들러
  http.delete('/interaction/v1/postings/:id/likes', ({ params }) => {
    const { id } = params;
    const postingId = id as string;
    const basePosting = mockPostingsData.find((post) => post.id === postingId);

    if (basePosting && likedPostings.has(postingId)) {
      basePosting.like_count = Math.max(0, basePosting.like_count - 1);
    }
    if (basePosting) {
      basePosting.likes_of_me = false;
    }
    likedPostings.delete(postingId);

    return HttpResponse.json({}, { status: 202 });
  }),

  // POST /api/v1/postings/:id/bookmarks 핸들러
  http.post('/interaction/v1/postings/:id/bookmarks', ({ params }) => {
    const { id } = params;
    const postingId = id as string;
    const basePosting = mockPostingsData.find((post) => post.id === postingId);

    if (basePosting) {
      basePosting.bookmarks_of_me = true;
    }
    bookmarkMap.set(postingId, Date.now());

    return HttpResponse.json({}, { status: 202 });
  }),

  // DELETE /api/v1/postings/:id/bookmarks 핸들러
  http.delete('/interaction/v1/postings/:id/bookmarks', ({ params }) => {
    const { id } = params;
    const postingId = id as string;
    const basePosting = mockPostingsData.find((post) => post.id === postingId);

    if (basePosting) {
      basePosting.bookmarks_of_me = false;
    }
    bookmarkMap.delete(postingId);

    return HttpResponse.json({}, { status: 202 });
  }),

  // GET /api/v1/me/bookmarks 핸들러
  http.get('/interaction/v1/me/bookmarks', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const allBookmarks = Array.from(bookmarkMap.keys())
      .map((postingId) => mockPostingsData.find((post) => post.id === postingId))
      .filter((post): post is PostingListItemDto => Boolean(post));

    const startIndex = page * size;
    const endIndex = startIndex + size;

    return HttpResponse.json({
      items: allBookmarks.slice(startIndex, endIndex),
      page,
      size,
      total_count: allBookmarks.length,
    });
  }),

  // POST /api/v1/postings/:id/comments 핸들러
  http.post('/interaction/v1/postings/:id/comments', async ({ request, params }) => {
    const { id } = params;
    const body = (await request.json()) as { content?: string };

    if (!body || typeof body.content !== 'string') {
      return HttpResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const postingId = id as string;
    const createdAt = new Date().toISOString();
    const comment: PostingCommentItem = {
      id: faker.string.uuid(),
      user_id: faker.internet.username(),
      parent_comment_id: '',
      has_child_comment: false,
      content: body.content,
      status: 'active',
      created_at: createdAt,
      updated_at: createdAt,
    };

    const comments = mockCommentsByPostId.get(postingId) ?? [];
    comments.unshift(comment);
    mockCommentsByPostId.set(postingId, comments);

    const basePosting = mockPostingsData.find((post) => post.id === postingId);
    if (basePosting) {
      basePosting.comment_count += 1;
    }

    return HttpResponse.json({ id: comment.id, created_at: createdAt }, { status: 201 });
  }),

  // GET /api/v1/postings/:id/comments 핸들러
  http.get('/interaction/v1/postings/:id/comments', ({ request, params }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const { id } = params;
    const comments = mockCommentsByPostId.get(id as string) ?? [];

    const targetComments = getRootComments(comments);

    const startIndex = page * size;
    const endIndex = startIndex + size;

    return HttpResponse.json({
      total_count: targetComments.length,
      page,
      size,
      items: targetComments.slice(startIndex, endIndex).map(toPostingCommentResponse),
    });
  }),

  http.get('/interaction/v1/comments/:commentId/replies', ({ request, params }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const replies = Array.from(mockCommentsByPostId.values()).flatMap((comments) =>
      getThreadReplies(comments, params.commentId as string),
    );
    const startIndex = page * size;

    return HttpResponse.json({
      total_count: replies.length,
      page,
      size,
      items: replies.slice(startIndex, startIndex + size).map(toPostingCommentResponse),
    });
  }),
];
