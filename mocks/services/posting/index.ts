import { http, HttpResponse } from 'msw';

import { faker } from '@faker-js/faker';

import type { PostingDetailDto, PostingListItemDto, SocialStatsDto } from '@/services/posting';

interface PostingCommentItem {
  id: string;
  user_id: string;
  post_id: string;
  parent_comment_id: string;
  has_child_comment: boolean;
  content: string;
  total_report_count: number;
  status?: string;
  created_at: number;
  updated_at: number;
}

// Mock 데이터 생성 함수
const generateMockPostings = (count: number): PostingListItemDto[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `posting-${index + 1}`,
    provider_id: `provider-${(index % 3) + 1}`,
    title: faker.lorem.sentence({ min: 4, max: 8 }),
    published_at: faker.date.recent({ days: 120 }).toISOString(),
    thumbnail_url: `https://picsum.photos/seed/${faker.string.uuid()}/300/200`,
    summary: faker.lorem.paragraphs({ min: 1, max: 2 }),
    status: faker.number.int({ min: 0, max: 2 }), // 0: draft, 1: published, 2: archived
    social: {
      like_count: faker.number.int({ min: 0, max: 1000 }),
      view_count: faker.number.int({ min: 0, max: 10000 }),
      is_liked: faker.datatype.boolean(),
      is_bookmarked: faker.datatype.boolean(),
      comment_count: faker.number.int({ min: 0, max: 100 }),
    } satisfies SocialStatsDto,
  }));
};

// Mock 게시물 데이터 생성
const mockPostingsData = generateMockPostings(110);
const likedPostings = new Set<string>(
  mockPostingsData.filter((post) => post.social.is_liked).map((post) => post.id),
);
const bookmarkMap = new Map<string, number>(
  mockPostingsData
    .filter((post) => post.social.is_bookmarked)
    .map((post, index) => [post.id, Date.now() - index * 60_000]),
);
const mockCommentsByPostId = new Map<string, PostingCommentItem[]>();

// 게시물 상세 데이터 생성 함수
const generateMockPostingDetail = (postingId: string): PostingDetailDto => {
  const basePosting = mockPostingsData.find((p) => p.id === postingId);
  if (!basePosting) {
    // 존재하지 않는 ID인 경우도 생성
    const index = parseInt(postingId.split('-')[1]) || 1;
    return {
      id: postingId,
      provider_id: `provider-${(index % 3) + 1}`,
      title: faker.lorem.sentence({ min: 4, max: 8 }),
      published_at: faker.date.recent({ days: 120 }).toISOString(),
      thumbnail_url: `https://picsum.photos/seed/${faker.string.uuid()}/300/200`,
      summary: faker.lorem.paragraphs({ min: 1, max: 2 }),
      status: faker.number.int({ min: 0, max: 2 }),
      social: {
        like_count: faker.number.int({ min: 0, max: 1000 }),
        view_count: faker.number.int({ min: 0, max: 10000 }),
        is_liked: faker.datatype.boolean(),
        is_bookmarked: faker.datatype.boolean(),
        comment_count: faker.number.int({ min: 0, max: 100 }),
      },
      url: `https://example.com/postings/${postingId}`,
      created_at: faker.date.past({ years: 1 }).toISOString(),
      updated_at: faker.date.recent({ days: 30 }).toISOString(),
    };
  }

  return {
    ...basePosting,
    social: {
      ...basePosting.social,
      is_liked: likedPostings.has(postingId),
      is_bookmarked: bookmarkMap.has(postingId),
    },
    url: `https://example.com/postings/${postingId}`,
    created_at: basePosting.published_at,
    updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
};

// GET /api/v1/postings 핸들러
export const postingsHandlers = [
  http.get('/api/v1/postings', ({ request }) => {
    console.log('mocking!!');
    const url = new URL(request.url);

    // 쿼리 파라미터 파싱
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const provider_id = url.searchParams.get('provider_id');
    const title = url.searchParams.get('title');

    // Mock 데이터 생성
    let allPostings = mockPostingsData;

    // 필터링
    if (provider_id) {
      allPostings = allPostings.filter((posting) => posting.provider_id === provider_id);
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
      total: allPostings.length,
      items: paginatedPostings,
    };

    return HttpResponse.json(response);
  }),

  // GET /api/v1/postings/:id 핸들러
  http.get('/api/v1/postings/:id', ({ params }) => {
    const { id } = params;
    const postingDetail = generateMockPostingDetail(id as string);
    return HttpResponse.json(postingDetail);
  }),

  // POST /api/v1/postings/:id/likes 핸들러
  http.post('/api/v1/postings/:id/likes', ({ params }) => {
    const { id } = params;
    const postingId = id as string;
    const basePosting = mockPostingsData.find((post) => post.id === postingId);

    if (basePosting && !likedPostings.has(postingId)) {
      basePosting.social.like_count += 1;
    }
    if (basePosting) {
      basePosting.social.is_liked = true;
    }
    likedPostings.add(postingId);

    return HttpResponse.json({}, { status: 202 });
  }),

  // DELETE /api/v1/postings/:id/likes 핸들러
  http.delete('/api/v1/postings/:id/likes', ({ params }) => {
    const { id } = params;
    const postingId = id as string;
    const basePosting = mockPostingsData.find((post) => post.id === postingId);

    if (basePosting && likedPostings.has(postingId)) {
      basePosting.social.like_count = Math.max(0, basePosting.social.like_count - 1);
    }
    if (basePosting) {
      basePosting.social.is_liked = false;
    }
    likedPostings.delete(postingId);

    return HttpResponse.json({}, { status: 202 });
  }),

  // POST /api/v1/postings/:id/bookmarks 핸들러
  http.post('/api/v1/postings/:id/bookmarks', ({ params }) => {
    const { id } = params;
    const postingId = id as string;
    const basePosting = mockPostingsData.find((post) => post.id === postingId);

    if (basePosting) {
      basePosting.social.is_bookmarked = true;
    }
    bookmarkMap.set(postingId, Date.now());

    return HttpResponse.json({}, { status: 202 });
  }),

  // DELETE /api/v1/postings/:id/bookmarks 핸들러
  http.delete('/api/v1/postings/:id/bookmarks', ({ params }) => {
    const { id } = params;
    const postingId = id as string;
    const basePosting = mockPostingsData.find((post) => post.id === postingId);

    if (basePosting) {
      basePosting.social.is_bookmarked = false;
    }
    bookmarkMap.delete(postingId);

    return HttpResponse.json({}, { status: 202 });
  }),

  // GET /api/v1/me/bookmarks 핸들러
  http.get('/api/v1/me/bookmarks', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const allBookmarks = Array.from(bookmarkMap.entries()).map(([post_id, created_at]) => ({
      post_id,
      created_at,
    }));

    const startIndex = page * size;
    const endIndex = startIndex + size;

    return HttpResponse.json({
      items: allBookmarks.slice(startIndex, endIndex),
    });
  }),

  // POST /api/v1/postings/:id/comments 핸들러
  http.post('/api/v1/postings/:id/comments', async ({ request, params }) => {
    const { id } = params;
    const body = (await request.json()) as { content?: string; parent_comment_id?: string };

    if (!body || typeof body.content !== 'string') {
      return HttpResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const postingId = id as string;
    const createdAt = Date.now();
    const comment: PostingCommentItem = {
      id: faker.string.uuid(),
      user_id: faker.internet.username(),
      post_id: postingId,
      parent_comment_id: body.parent_comment_id ?? '',
      has_child_comment: false,
      content: body.content,
      total_report_count: faker.number.int({ min: 0, max: 5 }),
      created_at: createdAt,
      updated_at: createdAt,
    };

    const comments = mockCommentsByPostId.get(postingId) ?? [];
    if (comment.parent_comment_id) {
      const parentComment = comments.find((item) => item.id === comment.parent_comment_id);
      if (parentComment) {
        parentComment.has_child_comment = true;
      }
    }
    comments.unshift(comment);
    mockCommentsByPostId.set(postingId, comments);

    const basePosting = mockPostingsData.find((post) => post.id === postingId);
    if (basePosting) {
      basePosting.social.comment_count += 1;
    }

    return HttpResponse.json({ id: comment.id, created_at: createdAt }, { status: 201 });
  }),

  // GET /api/v1/postings/:id/comments 핸들러
  http.get('/api/v1/postings/:id/comments', ({ request, params }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const { id } = params;
    const comments = mockCommentsByPostId.get(id as string) ?? [];
    const startIndex = page * size;
    const endIndex = startIndex + size;

    return HttpResponse.json({
      total_count: String(comments.length),
      items: comments.slice(startIndex, endIndex),
    });
  }),
];
