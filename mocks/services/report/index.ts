import { http, HttpResponse } from 'msw';

import { faker } from '@faker-js/faker';

const postingReports = Array.from({ length: 28 }, (_, index) => ({
  id: `posting-report-${index + 1}`,
  user_id: `user-${(index % 6) + 1}`,
  post_id: `posting-${(index % 12) + 1}`,
  report_type_code: ['POST_ERROR', 'LINK_ERROR', 'OTHER'][index % 3],
  content: faker.lorem.sentence({ min: 4, max: 12 }),
  created_at: new Date(Date.now() - index * 3_600_000).toISOString(),
  processed: index % 4 === 0 ? 'DONE' : 'OPEN',
}));

const commentReports = Array.from({ length: 32 }, (_, index) => ({
  id: `comment-report-${index + 1}`,
  user_id: `user-${(index % 6) + 1}`,
  comment_id: `comment-${(index % 20) + 1}`,
  post_id: `posting-${(index % 12) + 1}`,
  report_type_code: ['POLITICS', 'ADULT', 'OTHER'][index % 3],
  reason_type: ['POLITICS', 'ADULT', 'OTHER'][index % 3],
  content: faker.lorem.sentence({ min: 4, max: 12 }),
  created_at: new Date(Date.now() - index * 3_600_000).toISOString(),
  updated_at: new Date(Date.now() - index * 1_800_000).toISOString(),
  processed: index % 4 === 0 ? 'DONE' : 'OPEN',
  status: index % 4 === 0 ? 'DONE' : 'OPEN',
}));

const paginate = <T>(items: T[], request: Request) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '0');
  const size = parseInt(url.searchParams.get('size') || '20');
  const startIndex = page * size;

  return items.slice(startIndex, startIndex + size);
};

export const reportHandlers = [
  http.post('/api/v1/postings/:postingId/reports', async ({ request, params }) => {
    const body = (await request.json()) as { reason_type?: string; content?: string };
    const createdAt = new Date().toISOString();
    const report = {
      id: faker.string.uuid(),
      user_id: 'me',
      post_id: params.postingId as string,
      report_type_code: body.reason_type ?? 'OTHER',
      content: body.content ?? '',
      created_at: createdAt,
      processed: 'OPEN',
    };

    postingReports.unshift(report);

    return HttpResponse.json(
      {
        id: report.id,
        created_at: createdAt,
      },
      { status: 201 },
    );
  }),

  http.post('/api/v1/comments/:commentId/reports', async ({ request, params }) => {
    const body = (await request.json()) as { reason_type?: string; content?: string };
    const createdAt = new Date().toISOString();
    const report = {
      id: faker.string.uuid(),
      user_id: 'me',
      comment_id: params.commentId as string,
      post_id: `posting-${faker.number.int({ min: 1, max: 12 })}`,
      report_type_code: body.reason_type ?? 'OTHER',
      reason_type: body.reason_type ?? 'OTHER',
      content: body.content ?? '',
      created_at: createdAt,
      updated_at: createdAt,
      processed: 'OPEN',
      status: 'OPEN',
    };

    commentReports.unshift(report);

    return HttpResponse.json(
      {
        id: report.id,
        created_at: createdAt,
      },
      { status: 201 },
    );
  }),

  http.get('/api/v1/admin/reports/postings', ({ request }) =>
    HttpResponse.json({
      total_count: postingReports.length,
      items: paginate(postingReports, request),
    }),
  ),

  http.patch('/api/v1/admin/reports/postings/:reportId', async ({ request, params }) => {
    const body = (await request.json()) as { status?: string };
    const updatedAt = new Date().toISOString();
    const report = postingReports.find((item) => item.id === params.reportId);

    if (report && body.status) {
      report.processed = body.status;
    }

    return HttpResponse.json({
      id: params.reportId,
      updated_at: updatedAt,
    });
  }),

  http.get('/api/v1/admin/reports/comments', ({ request }) =>
    HttpResponse.json({
      total_count: commentReports.length,
      items: paginate(commentReports, request),
    }),
  ),

  http.patch('/api/v1/admin/reports/comments/:reportId', async ({ request, params }) => {
    const body = (await request.json()) as { status?: string };
    const updatedAt = new Date().toISOString();
    const report = commentReports.find((item) => item.id === params.reportId);

    if (report && body.status) {
      report.status = body.status;
      report.processed = body.status;
      report.updated_at = updatedAt;
    }

    return HttpResponse.json({
      id: params.reportId,
      updated_at: updatedAt,
    });
  }),
];
