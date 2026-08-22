import { AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createProvider,
  getCollectJob,
  getCollectPosting,
  getSource,
  startCollectJob,
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

describe('collect OpenAPI contract', () => {
  it('creates providers without the update-only is_used field', async () => {
    const post = vi
      .spyOn(api, 'post')
      .mockResolvedValue(axiosResponse({ created_at: '2026-08-22T00:00:00Z', provider_id: 'p-1' }));

    await createProvider({ base_url: 'https://example.com', description: 'Example', name: 'Example' });

    expect(post).toHaveBeenCalledWith('/collect/v1/providers', {
      base_url: 'https://example.com',
      description: 'Example',
      name: 'Example',
    });
  });

  it('maps source cron page bounds', async () => {
    vi.spyOn(api, 'get').mockResolvedValue(
      axiosResponse({
        created_at: '2026-08-22T00:00:00Z',
        cron_expression: '0 0 3 * * *',
        cron_from_page: 1,
        cron_to_page: 3,
        is_used: true,
        provider_id: 'provider-1',
        schedule_type: 'cron',
        source_id: 'source-1',
        updated_at: '2026-08-22T01:00:00Z',
        url: 'https://example.com/articles',
      }),
    );

    await expect(getSource('source-1')).resolves.toMatchObject({
      cronFromPage: 1,
      cronToPage: 3,
      scheduleType: 'cron',
    });
  });

  it('sends collection page bounds and force flag as query parameters', async () => {
    const post = vi
      .spyOn(api, 'post')
      .mockResolvedValue(axiosResponse({ job_id: 'job-1', job_status: 'pending' }));

    await startCollectJob('source-1', { force_recollect: true, from_page: '2', to_page: '5' });

    expect(post).toHaveBeenCalledWith('/collect/v1/sources/source-1/_start', undefined, {
      params: { force_recollect: true, from_page: '2', to_page: '5' },
    });
  });

  it('maps current collecting job fields', async () => {
    vi.spyOn(api, 'get').mockResolvedValue(
      axiosResponse({
        attempt_count: 1,
        collected_count: 8,
        collecting_status: 'parsed',
        ended_at: '2026-08-22T01:00:00Z',
        error_message: '',
        force_recollect: true,
        from_page: 2,
        job_id: 'job-1',
        job_status: 'success',
        started_at: '2026-08-22T00:00:00Z',
        to_page: 5,
        total_count: 8,
        triggered_by: 'user-1',
      }),
    );

    await expect(getCollectJob('job-1')).resolves.toMatchObject({
      collectingStatus: 'parsed',
      errorMessage: '',
      forceRecollect: true,
      fromPage: 2,
      toPage: 5,
    });
  });

  it('maps current collected posting indexing fields', async () => {
    vi.spyOn(api, 'get').mockResolvedValue(
      axiosResponse({
        collect_source_id: 'source-1',
        indexing_error_count: 0,
        indexing_status: 'indexed',
        last_collected_at: '2026-08-22T00:00:00Z',
        last_collecting_job_id: 'job-1',
        last_indexed_at: '2026-08-22T01:00:00Z',
        posting_id: 'post-1',
        published_at: '2026-08-22',
        summary: 'Summary',
        thumbnail_url: 'https://example.com/image.png',
        title: 'Title',
        url: 'https://example.com/post',
      }),
    );

    await expect(getCollectPosting('post-1')).resolves.toMatchObject({
      indexingStatus: 'indexed',
      lastIndexedAt: Date.parse('2026-08-22T01:00:00Z'),
      summary: 'Summary',
    });
  });
});
