import { http, HttpResponse } from 'msw';

import { faker } from '@faker-js/faker';

import type {
  CommentReportDto,
  CommentReportReasonType,
  CreateReportRequestDto,
  PostingReportDto,
  PostingReportReasonType,
  UpdateReportStatusRequestDto,
} from '@/services/report';

const postingReports: PostingReportDto[] = Array.from({ length: 28 }, (_, index) => ({
  id: `posting-report-${index + 1}`,
  nickname: `reporter-${(index % 6) + 1}`,
  title: `Mock posting ${(index % 12) + 1}`,
  report_type: ['invalid_content', 'broken_link', 'other'][index % 3] as PostingReportReasonType,
  content: faker.lorem.sentence({ min: 4, max: 12 }),
  created_at: new Date(Date.now() - index * 3_600_000).toISOString(),
  updated_at: new Date(Date.now() - index * 1_800_000).toISOString(),
  status: index % 4 === 0 ? 'resolved_deleted' : 'pending',
}));

const commentReports: CommentReportDto[] = Array.from({ length: 32 }, (_, index) => ({
  id: `comment-report-${index + 1}`,
  nickname: `reporter-${(index % 6) + 1}`,
  comment_content: `Mock comment ${(index % 20) + 1}`,
  report_type: ['political', 'adult', 'other'][index % 3] as CommentReportReasonType,
  content: faker.lorem.sentence({ min: 4, max: 12 }),
  created_at: new Date(Date.now() - index * 3_600_000).toISOString(),
  updated_at: new Date(Date.now() - index * 1_800_000).toISOString(),
  status: index % 4 === 0 ? 'resolved_deleted' : 'pending',
}));

const paginate = <T>(items: T[], request: Request) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '0');
  const size = parseInt(url.searchParams.get('size') || '20');
  const startIndex = page * size;

  return items.slice(startIndex, startIndex + size);
};

export const reportHandlers = [
  http.post('/interaction/v1/postings/:postingId/reports', async ({ request, params }) => {
    const body = (await request.json()) as CreateReportRequestDto<PostingReportReasonType>;
    const createdAt = new Date().toISOString();
    const report: PostingReportDto = {
      id: faker.string.uuid(),
      nickname: 'mock-user',
      title: `Mock posting ${params.postingId as string}`,
      report_type: body.report_type ?? 'other',
      content: body.content ?? '',
      created_at: createdAt,
      updated_at: createdAt,
      status: 'pending',
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

  http.post('/interaction/v1/comments/:commentId/reports', async ({ request, params }) => {
    const body = (await request.json()) as CreateReportRequestDto<CommentReportReasonType>;
    const createdAt = new Date().toISOString();
    const report: CommentReportDto = {
      id: faker.string.uuid(),
      nickname: 'mock-user',
      comment_content: `Mock comment ${params.commentId as string}`,
      report_type: body.report_type ?? 'other',
      content: body.content ?? '',
      created_at: createdAt,
      updated_at: createdAt,
      status: 'pending',
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

  http.get('/interaction/v1/admin/reports/postings', ({ request }) =>
    HttpResponse.json(
      (() => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') ?? 0);
        const size = Number(url.searchParams.get('size') ?? 20);
        return {
          total_count: postingReports.length,
          page,
          size,
          items: paginate(postingReports, request),
        };
      })(),
    ),
  ),

  http.patch('/interaction/v1/admin/reports/postings/:reportId', async ({ request, params }) => {
    const body = (await request.json()) as Partial<UpdateReportStatusRequestDto>;
    const updatedAt = new Date().toISOString();
    const report = postingReports.find((item) => item.id === params.reportId);

    if (report && body.status) {
      report.status = body.status;
      report.updated_at = updatedAt;
    }

    return HttpResponse.json({
      id: params.reportId,
      status: body.status ?? report?.status ?? 'pending',
      updated_at: updatedAt,
    });
  }),

  http.get('/interaction/v1/admin/reports/comments', ({ request }) =>
    HttpResponse.json(
      (() => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') ?? 0);
        const size = Number(url.searchParams.get('size') ?? 20);
        return {
          total_count: commentReports.length,
          page,
          size,
          items: paginate(commentReports, request),
        };
      })(),
    ),
  ),

  http.patch('/interaction/v1/admin/reports/comments/:reportId', async ({ request, params }) => {
    const body = (await request.json()) as Partial<UpdateReportStatusRequestDto>;
    const updatedAt = new Date().toISOString();
    const report = commentReports.find((item) => item.id === params.reportId);

    if (report && body.status) {
      report.status = body.status;
      report.updated_at = updatedAt;
    }

    return HttpResponse.json({
      id: params.reportId,
      status: body.status ?? report?.status ?? 'pending',
      updated_at: updatedAt,
    });
  }),
];
