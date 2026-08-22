import { http, HttpResponse } from 'msw';

import { faker } from '@faker-js/faker';

const providers = Array.from({ length: 18 }, (_, index) => ({
  provider_id: `provider-${index + 1}`,
  name: `Provider ${index + 1}`,
  base_url: `https://provider-${index + 1}.example.com`,
  description: faker.lorem.sentence({ min: 4, max: 10 }),
  is_used: index % 5 !== 0,
  has_using_collect_source: index % 3 === 0,
  using_collect_source_id: index % 3 === 0 ? `source-${index + 1}` : undefined,
  created_at: new Date(Date.now() - index * 86_400_000).toISOString(),
  updated_at: new Date(Date.now() - index * 43_200_000).toISOString(),
}));

const sources = Array.from({ length: 24 }, (_, index) => {
  const scheduleType = index % 2 === 0 ? 'manual' : 'cron';

  return {
    source_id: `source-${index + 1}`,
    provider_id: providers[index % providers.length].provider_id,
    url: `https://provider-${(index % providers.length) + 1}.example.com/feed/${index + 1}`,
    schedule_type: scheduleType,
    cron_expression: scheduleType === 'cron' ? '0 */6 * * *' : undefined,
    cron_from_page: scheduleType === 'cron' ? 1 : undefined,
    cron_to_page: scheduleType === 'cron' ? 3 : undefined,
    is_used: index % 4 !== 0,
    created_at: new Date(Date.now() - index * 86_400_000).toISOString(),
    updated_at: new Date(Date.now() - index * 43_200_000).toISOString(),
  };
});

const jobs = Array.from({ length: 30 }, (_, index) => ({
  job_id: `job-${index + 1}`,
  job_status: ['pending', 'running', 'success', 'failed'][index % 4],
  collecting_status: ['discovered', 'fetched', 'parsed', 'fetch_failed'][index % 4],
  triggered_by: `user-${(index % 5) + 1}`,
  from_page: 1,
  to_page: 3,
  force_recollect: false,
  total_count: faker.number.int({ min: 20, max: 200 }),
  collected_count: faker.number.int({ min: 0, max: 120 }),
  attempt_count: faker.number.int({ min: 1, max: 3 }),
  started_at: new Date(Date.now() - index * 3_600_000).toISOString(),
  ended_at: index % 4 === 0 ? undefined : new Date(Date.now() - index * 3_000_000).toISOString(),
  error_message: index % 4 === 3 ? 'Fetch failed' : undefined,
}));

const collectPostings = Array.from({ length: 40 }, (_, index) => ({
  posting_id: `collect-posting-${index + 1}`,
  collect_source_id: sources[index % sources.length].source_id,
  title: faker.lorem.sentence({ min: 4, max: 9 }),
  summary: faker.lorem.paragraph(),
  url: `https://example.com/collect-postings/${index + 1}`,
  published_at: faker.date.recent({ days: 90 }).toISOString(),
  thumbnail_url: `https://picsum.photos/seed/collect-${index + 1}/320/180`,
  indexing_error_count: faker.number.int({ min: 0, max: 3 }),
  indexing_status: ['pending', 'indexing', 'indexed', 'failed'][index % 4],
  last_collected_at: new Date(Date.now() - index * 3_600_000).toISOString(),
  last_collecting_job_id: jobs[index % jobs.length].job_id,
  last_indexed_at: index % 4 === 2 ? new Date().toISOString() : undefined,
}));

const paginate = <T>(items: T[], request: Request) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '0');
  const size = parseInt(url.searchParams.get('size') || '20');
  const startIndex = page * size;

  return {
    total_count: items.length,
    page,
    size,
    items: items.slice(startIndex, startIndex + size),
  };
};

export const collectHandlers = [
  http.post('/collect/v1/providers', async ({ request }) => {
    const body = (await request.json()) as {
      name?: string;
      base_url?: string;
      description?: string;
    };
    const createdAt = new Date().toISOString();
    const provider = {
      provider_id: faker.string.uuid(),
      name: body.name ?? 'New Provider',
      base_url: body.base_url ?? 'https://new-provider.example.com',
      description: body.description ?? '',
      is_used: true,
      has_using_collect_source: false,
      using_collect_source_id: undefined,
      created_at: createdAt,
      updated_at: createdAt,
    };

    providers.unshift(provider);

    return HttpResponse.json(
      {
        provider_id: provider.provider_id,
        created_at: createdAt,
      },
      { status: 201 },
    );
  }),

  http.get('/collect/v1/providers', ({ request }) => HttpResponse.json(paginate(providers, request))),

  http.get('/collect/v1/providers/:providerId', ({ params }) => {
    const provider =
      providers.find((item) => item.provider_id === params.providerId) ?? providers[0];

    return HttpResponse.json(provider);
  }),

  http.patch('/collect/v1/providers/:providerId', async ({ request, params }) => {
    const body = (await request.json()) as {
      base_url?: string;
      description?: string;
      is_used?: boolean;
    };
    const updatedAt = new Date().toISOString();
    const provider = providers.find((item) => item.provider_id === params.providerId);

    if (provider) {
      provider.base_url = body.base_url ?? provider.base_url;
      provider.description = body.description ?? provider.description;
      provider.is_used = body.is_used ?? provider.is_used;
      provider.updated_at = updatedAt;
    }

    return HttpResponse.json({
      provider_id: params.providerId,
      updated_at: updatedAt,
    });
  }),

  http.delete('/collect/v1/providers/:providerId', () => new HttpResponse(null, { status: 202 })),

  http.post('/collect/v1/sources', async ({ request }) => {
    const body = (await request.json()) as {
      provider_id?: string;
      url?: string;
      schedule_type?: 'manual' | 'cron';
      cron_expression?: string;
      cron_from_page?: number;
      cron_to_page?: number;
    };
    const createdAt = new Date().toISOString();
    const source = {
      source_id: faker.string.uuid(),
      provider_id: body.provider_id ?? providers[0].provider_id,
      url: body.url ?? 'https://example.com/feed',
      schedule_type: body.schedule_type ?? 'manual',
      cron_expression: body.cron_expression,
      cron_from_page: body.cron_from_page,
      cron_to_page: body.cron_to_page,
      is_used: true,
      created_at: createdAt,
      updated_at: createdAt,
    };

    sources.unshift(source);

    return HttpResponse.json(
      {
        source_id: source.source_id,
        created_at: createdAt,
      },
      { status: 201 },
    );
  }),

  http.get('/collect/v1/sources', ({ request }) => HttpResponse.json(paginate(sources, request))),

  http.get('/collect/v1/sources/:sourceId', ({ params }) => {
    const source = sources.find((item) => item.source_id === params.sourceId) ?? sources[0];

    return HttpResponse.json(source);
  }),

  http.patch('/collect/v1/sources/:sourceId', async ({ request, params }) => {
    const body = (await request.json()) as {
      url?: string;
      collect_schedule_type?: 'manual' | 'cron';
      is_used?: boolean;
      cron_expression?: string;
      cron_from_page?: number;
      cron_to_page?: number;
    };
    const updatedAt = new Date().toISOString();
    const source = sources.find((item) => item.source_id === params.sourceId);

    if (source) {
      source.url = body.url ?? source.url;
      source.schedule_type = body.collect_schedule_type ?? source.schedule_type;
      source.is_used = body.is_used ?? source.is_used;
      source.cron_expression = body.cron_expression ?? source.cron_expression;
      source.cron_from_page = body.cron_from_page ?? source.cron_from_page;
      source.cron_to_page = body.cron_to_page ?? source.cron_to_page;
      source.updated_at = updatedAt;
    }

    return HttpResponse.json({
      source_id: params.sourceId,
      updated_at: updatedAt,
    });
  }),

  http.delete('/collect/v1/sources/:sourceId', () => new HttpResponse(null, { status: 202 })),

  http.post('/collect/v1/sources/:sourceId/_start', ({ request }) => {
    const url = new URL(request.url);
    const job = {
      job_id: faker.string.uuid(),
      job_status: 'pending',
      collecting_status: 'discovered',
      triggered_by: 'me',
      from_page: Number(url.searchParams.get('from_page') ?? 1),
      to_page: Number(url.searchParams.get('to_page') ?? 1),
      force_recollect: url.searchParams.get('force_recollect') === 'true',
      total_count: 0,
      collected_count: 0,
      attempt_count: 1,
      started_at: new Date().toISOString(),
      ended_at: undefined,
      error_message: undefined,
    };

    jobs.unshift(job);

    return HttpResponse.json({
      job_id: job.job_id,
      job_status: job.job_status,
    });
  }),

  http.post('/collect/v1/sources/:sourceId/_stop', () => new HttpResponse(null, { status: 202 })),

  http.get('/collect/v1/jobs', ({ request }) => HttpResponse.json(paginate(jobs, request))),

  http.get('/collect/v1/jobs/:jobId', ({ params }) => {
    const job = jobs.find((item) => item.job_id === params.jobId) ?? jobs[0];

    return HttpResponse.json(job);
  }),

  http.get('/collect/v1/postings/:postingId', ({ params }) => {
    const posting =
      collectPostings.find((item) => item.posting_id === params.postingId) ?? collectPostings[0];

    return HttpResponse.json(posting);
  }),
];
