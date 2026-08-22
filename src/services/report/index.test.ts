import { AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createCommentReport,
  createPostingReport,
  getAdminCommentReports,
  getAdminPostingReports,
  updateAdminPostingReportStatus,
} from './index';

import { api } from '../api';

const axiosResponse = <T>(data: T) => ({
  config: { headers: new AxiosHeaders() },
  data,
  headers: {},
  status: 200,
  statusText: 'OK',
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('report OpenAPI contract', () => {
  it('sends current posting and comment report request bodies', async () => {
    const post = vi
      .spyOn(api, 'post')
      .mockResolvedValue(axiosResponse({ created_at: '2026-08-22T00:00:00Z', id: 'report-1' }));

    await createPostingReport('post-1', {
      content: 'broken',
      report_type: 'broken_link',
    });
    await createCommentReport('comment-1', {
      content: 'political',
      report_type: 'political',
    });

    expect(post).toHaveBeenNthCalledWith(1, '/interaction/v1/postings/post-1/reports', {
      content: 'broken',
      report_type: 'broken_link',
    });
    expect(post).toHaveBeenNthCalledWith(2, '/interaction/v1/comments/comment-1/reports', {
      content: 'political',
      report_type: 'political',
    });
  });

  it('maps paged posting reports using title and nickname', async () => {
    vi.spyOn(api, 'get').mockResolvedValue(
      axiosResponse({
        items: [
          {
            content: 'bad content',
            created_at: '2026-08-22T00:00:00Z',
            id: 'report-1',
            nickname: 'reporter',
            report_type: 'invalid_content',
            status: 'pending',
            title: 'Reported post title',
            updated_at: '2026-08-22T01:00:00Z',
          },
        ],
        page: 0,
        size: 20,
        total_count: 1,
      }),
    );

    await expect(getAdminPostingReports()).resolves.toEqual({
      items: [
        {
          content: 'bad content',
          createdAt: Date.parse('2026-08-22T00:00:00Z'),
          id: 'report-1',
          nickname: 'reporter',
          reportType: 'invalid_content',
          status: 'pending',
          title: 'Reported post title',
          updatedAt: Date.parse('2026-08-22T01:00:00Z'),
        },
      ],
      page: 0,
      size: 20,
      totalCount: 1,
    });
  });

  it('maps paged comment reports using comment content and nickname', async () => {
    vi.spyOn(api, 'get').mockResolvedValue(
      axiosResponse({
        items: [
          {
            comment_content: 'Original comment',
            content: 'political',
            created_at: '2026-08-22T00:00:00Z',
            id: 'report-1',
            nickname: 'reporter',
            report_type: 'political',
            status: 'rejected_keep',
            updated_at: '2026-08-22T01:00:00Z',
          },
        ],
        page: 0,
        size: 20,
        total_count: 1,
      }),
    );

    await expect(getAdminCommentReports()).resolves.toMatchObject({
      items: [
        {
          commentContent: 'Original comment',
          nickname: 'reporter',
          reportType: 'political',
          status: 'rejected_keep',
        },
      ],
      page: 0,
      size: 20,
      totalCount: 1,
    });
  });

  it('maps the status returned by report updates', async () => {
    vi.spyOn(api, 'patch').mockResolvedValue(
      axiosResponse({
        id: 'report-1',
        status: 'resolved_deleted',
        updated_at: '2026-08-22T01:00:00Z',
      }),
    );

    await expect(
      updateAdminPostingReportStatus('report-1', { status: 'resolved_deleted' } as never),
    ).resolves.toEqual({
      id: 'report-1',
      status: 'resolved_deleted',
      updatedAt: Date.parse('2026-08-22T01:00:00Z'),
    });
  });
});
