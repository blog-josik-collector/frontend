import { AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCommentReplies } from './replies';

import { api } from '../api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('comment replies OpenAPI contract', () => {
  it('maps the common paged comment response', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      config: { headers: new AxiosHeaders() },
      data: {
        items: [
          {
            content: 'Reply',
            created_at: '2026-08-22T00:00:00Z',
            has_child_comment: false,
            id: 'reply-1',
            status: 'active',
            updated_at: '2026-08-22T01:00:00Z',
            user_id: 'user-1',
          },
        ],
        page: 0,
        size: 5,
        total_count: 1,
      },
      headers: {},
      status: 200,
      statusText: 'OK',
    });

    await expect(getCommentReplies('comment-1', { page: 0, size: 5 })).resolves.toEqual({
      items: [
        {
          content: 'Reply',
          createdAt: Date.parse('2026-08-22T00:00:00Z'),
          hasChildComment: false,
          id: 'reply-1',
          status: 'active',
          updatedAt: Date.parse('2026-08-22T01:00:00Z'),
          userId: 'user-1',
        },
      ],
      page: 0,
      size: 5,
      totalCount: 1,
    });
  });
});
