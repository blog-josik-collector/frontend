import { http, HttpResponse } from 'msw';

import type { PostingItemDto, SocialStatsDto } from '@/services/posting';

// Mock 데이터 생성 함수
const generateMockPostings = (count: number): PostingItemDto[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `posting-${index + 1}`,
    provider_id: `provider-${(index % 3) + 1}`,
    title: `포스팅 제목 ${index + 1}`,
    published_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail_url: `https://picsum.photos/300/200?random=${index + 1}`,
    summary: `이것은 포스팅 ${index + 1}의 요약 내용입니다. 간단한 설명이 포함되어 있습니다.`,
    status: Math.floor(Math.random() * 3), // 0: draft, 1: published, 2: archived
    social: {
      like_count: Math.floor(Math.random() * 1000),
      view_count: Math.floor(Math.random() * 10000),
      is_liked: Math.random() > 0.7,
      is_bookmarted: Math.random() > 0.8,
    } as SocialStatsDto,
  }));
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
    let allPostings = generateMockPostings(100); // 100개의 mock 데이터

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
];
