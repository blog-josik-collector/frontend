import { AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getMyBookmarks, getPostingComments, getPostings } from './index';

import { api } from '../api';

const axiosResponse = <T>(data: T) => ({
  config: { headers: new AxiosHeaders() },
  data,
  headers: {},
  status: 200,
  statusText: 'OK',
});

const postDto = {
  bookmarks_of_me: false,
  comment_count: 2,
  created_at: '2026-08-22T00:00:00Z',
  id: 'post-1',
  like_count: 3,
  likes_of_me: true,
  provider: 'Provider',
  published_at: '2026-08-22',
  status: 'active',
  summary: 'Summary',
  thumbnail_url: 'https://example.com/image.png',
  title: 'Title',
  total_report_count: 0,
  updated_at: '2026-08-22T01:00:00Z',
  url: 'https://example.com/post',
  view_count: 7,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('posting OpenAPI contract', () => {
  it('maps the flat paged posting response and sends the provider query', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue(
      axiosResponse({ items: [postDto], page: 0, size: 10, total_count: 1 }),
    );

    const result = await getPostings({ provider: 'Provider' });

    expect(result).toEqual({
      items: [
        {
          createdAt: Date.parse('2026-08-22T00:00:00Z'),
          id: 'post-1',
          provider: 'Provider',
          publishedAt: Date.parse('2026-08-21T15:00:00Z'),
          social: {
            commentCount: 2,
            isBookmarked: false,
            isLiked: true,
            likeCount: 3,
            viewCount: 7,
          },
          status: 'active',
          summary: 'Summary',
          thumbnailUrl: 'https://example.com/image.png',
          title: 'Title',
          totalReportCount: 0,
          updatedAt: Date.parse('2026-08-22T01:00:00Z'),
          url: 'https://example.com/post',
        },
      ],
      page: 0,
      size: 10,
      totalCount: 1,
    });
    expect(get).toHaveBeenCalledWith('/interaction/v1/postings', {
      params: { provider: 'Provider' },
    });
  });

  it('maps bookmarked PostDocument items instead of legacy bookmark records', async () => {
    vi.spyOn(api, 'get').mockResolvedValue(
      axiosResponse({
        items: [
          {
            comment_count: 2,
            created_at: '2026-08-22T00:00:00Z',
            id: 'post-1',
            like_count: 3,
            provider: 'Provider',
            published_at: '2026-08-22',
            status: 'active',
            summary: 'Summary',
            thumbnail_url: 'https://example.com/image.png',
            title: 'Title',
            total_report_count: 0,
            updated_at: '2026-08-22T01:00:00Z',
            url: 'https://example.com/post',
            view_count: 7,
          },
        ],
        page: 0,
        size: 20,
        total_count: 1,
      }),
    );

    await expect(getMyBookmarks()).resolves.toMatchObject({
      items: [{ id: 'post-1', provider: 'Provider', title: 'Title' }],
      page: 0,
      size: 20,
      totalCount: 1,
    });
  });

  it('maps numeric comment pagination and ISO timestamps', async () => {
    vi.spyOn(api, 'get').mockResolvedValue(
      axiosResponse({
        items: [
          {
            content: 'Comment',
            created_at: '2026-08-22T00:00:00Z',
            has_child_comment: true,
            id: 'comment-1',
            status: 'active',
            updated_at: '2026-08-22T01:00:00Z',
            user_id: 'user-1',
          },
        ],
        page: 0,
        size: 20,
        total_count: 1,
      }),
    );

    await expect(getPostingComments('post-1')).resolves.toEqual({
      items: [
        {
          content: 'Comment',
          createdAt: Date.parse('2026-08-22T00:00:00Z'),
          hasChildComment: true,
          id: 'comment-1',
          status: 'active',
          updatedAt: Date.parse('2026-08-22T01:00:00Z'),
          userId: 'user-1',
        },
      ],
      page: 0,
      size: 20,
      totalCount: 1,
    });
  });
});
