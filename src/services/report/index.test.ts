import { AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
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
  it('maps paged posting reports using reporter, report type, and status', async () => {
    vi.spyOn(api, 'get').mockResolvedValue(
      axiosResponse({
        items: [
          {
            content: 'bad content',
            created_at: '2026-08-22T00:00:00Z',
            id: 'report-1',
            post_id: 'post-1',
            report_type: 'invalid_content',
            reporter_id: 'user-1',
            status: 'pending',
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
          postId: 'post-1',
          reportType: 'invalid_content',
          reporterId: 'user-1',
          status: 'pending',
          updatedAt: Date.parse('2026-08-22T01:00:00Z'),
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
