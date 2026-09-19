import { AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getMyComments } from './me';

import { api } from '../api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('my comments OpenAPI contract', () => {
  it('maps the paged response with nickname and parent-comment status', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      config: { headers: new AxiosHeaders() },
      data: {
        items: [
          {
            content: 'Comment',
            created_at: '2026-08-22T00:00:00Z',
            has_child_comment: false,
            has_parent_comment: true,
            id: 'comment-1',
            status: 'active',
            updated_at: '2026-08-22T01:00:00Z',
            nickname: 'commenter',
          },
        ],
        page: 0,
        size: 20,
        total_count: 1,
      },
      headers: {},
      status: 200,
      statusText: 'OK',
    });

    await expect(getMyComments()).resolves.toEqual({
      items: [
        {
          content: 'Comment',
          createdAt: Date.parse('2026-08-22T00:00:00Z'),
          hasChildComment: false,
          hasParentComment: true,
          id: 'comment-1',
          status: 'active',
          updatedAt: Date.parse('2026-08-22T01:00:00Z'),
          nickname: 'commenter',
        },
      ],
      page: 0,
      size: 20,
      totalCount: 1,
    });
  });
});
