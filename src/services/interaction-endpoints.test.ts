import { AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { api } from './api';
import {
  createPostingBookmark,
  createPostingComment,
  createPostingLike,
  deletePostingBookmark,
  deletePostingLike,
  getMyBookmarks,
  getPostingComments,
  getPostingDetail,
  getPostings,
} from './posting';
import {
  CommentReportReasonType,
  createCommentReport,
  createPostingReport,
  getAdminCommentReports,
  getAdminPostingReports,
  PostingReportReasonType,
  ReportProcessStatus,
  updateAdminCommentReportStatus,
  updateAdminPostingReportStatus,
} from './report';
import { deleteComment, updateComment } from './comment/comments';
import { getMyComments } from './comment/me';
import {
  createReply,
  deleteReply,
  getCommentReplies,
  updateReply,
} from './comment/replies';

const response = {
  config: { headers: new AxiosHeaders() },
  data: {
    created_at: 0,
    id: 'resource-1',
    items: [],
    parent_id: 'comment-1',
    provider_id: 'provider-1',
    published_at: '2026-08-22T00:00:00Z',
    social: {
      comment_count: 0,
      is_bookmarked: false,
      is_liked: false,
      like_count: 0,
      view_count: 0,
    },
    status: 0,
    summary: '',
    thumbnail_url: '',
    title: '',
    total: 0,
    total_count: 0,
    updated_at: 0,
    url: '',
  },
  headers: {},
  status: 200,
  statusText: 'OK',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('interaction service endpoint contract', () => {
  it('emits every method and path defined by the interaction OpenAPI snapshot', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue(response);
    const post = vi.spyOn(api, 'post').mockResolvedValue(response);
    const patch = vi.spyOn(api, 'patch').mockResolvedValue(response);
    const remove = vi.spyOn(api, 'delete').mockResolvedValue(response);

    const cases: Array<{
      expected: [method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string];
      run: () => Promise<unknown>;
    }> = [
      { expected: ['GET', '/interaction/v1/postings'], run: () => getPostings() },
      {
        expected: ['POST', '/interaction/v1/postings/post-1/likes'],
        run: () => createPostingLike('post-1'),
      },
      {
        expected: ['DELETE', '/interaction/v1/postings/post-1/likes'],
        run: () => deletePostingLike('post-1'),
      },
      {
        expected: ['POST', '/interaction/v1/postings/post-1/bookmarks'],
        run: () => createPostingBookmark('post-1'),
      },
      {
        expected: ['DELETE', '/interaction/v1/postings/post-1/bookmarks'],
        run: () => deletePostingBookmark('post-1'),
      },
      { expected: ['GET', '/interaction/v1/me/bookmarks'], run: () => getMyBookmarks() },
      {
        expected: ['POST', '/interaction/v1/postings/post-1/comments'],
        run: () => createPostingComment('post-1', { content: 'comment' }),
      },
      {
        expected: ['GET', '/interaction/v1/postings/post-1/comments'],
        run: () => getPostingComments('post-1'),
      },
      {
        expected: ['GET', '/interaction/v1/postings/post-1'],
        run: () => getPostingDetail('post-1'),
      },
      {
        expected: ['PATCH', '/interaction/v1/comments/comment-1'],
        run: () => updateComment('comment-1', { content: 'updated comment' }),
      },
      {
        expected: ['DELETE', '/interaction/v1/comments/comment-1'],
        run: () => deleteComment('comment-1'),
      },
      { expected: ['GET', '/interaction/v1/me/comments'], run: () => getMyComments() },
      {
        expected: ['POST', '/interaction/v1/comments/comment-1/replies'],
        run: () => createReply('comment-1', { content: 'reply' }),
      },
      {
        expected: ['GET', '/interaction/v1/comments/comment-1/replies'],
        run: () => getCommentReplies('comment-1'),
      },
      {
        expected: ['PATCH', '/interaction/v1/replies/reply-1'],
        run: () => updateReply('reply-1', { content: 'updated reply' }),
      },
      {
        expected: ['DELETE', '/interaction/v1/replies/reply-1'],
        run: () => deleteReply('reply-1'),
      },
      {
        expected: ['POST', '/interaction/v1/postings/post-1/reports'],
        run: () =>
          createPostingReport('post-1', {
            content: 'posting report',
            reason_type: PostingReportReasonType.Other,
          }),
      },
      {
        expected: ['POST', '/interaction/v1/comments/comment-1/reports'],
        run: () =>
          createCommentReport('comment-1', {
            content: 'comment report',
            reason_type: CommentReportReasonType.Other,
          }),
      },
      {
        expected: ['GET', '/interaction/v1/admin/reports/postings'],
        run: () => getAdminPostingReports(),
      },
      {
        expected: ['PATCH', '/interaction/v1/admin/reports/postings/report-1'],
        run: () =>
          updateAdminPostingReportStatus('report-1', { status: ReportProcessStatus.Done }),
      },
      {
        expected: ['GET', '/interaction/v1/admin/reports/comments'],
        run: () => getAdminCommentReports(),
      },
      {
        expected: ['PATCH', '/interaction/v1/admin/reports/comments/report-1'],
        run: () =>
          updateAdminCommentReportStatus('report-1', { status: ReportProcessStatus.Done }),
      },
    ];

    for (const { run } of cases) {
      await run();
    }

    const requests = [
      ...get.mock.calls.map(([url]) => ['GET', url]),
      ...post.mock.calls.map(([url]) => ['POST', url]),
      ...patch.mock.calls.map(([url]) => ['PATCH', url]),
      ...remove.mock.calls.map(([url]) => ['DELETE', url]),
    ];

    expect(requests).toEqual(expect.arrayContaining(cases.map(({ expected }) => expected)));
    expect(requests).toHaveLength(cases.length);
  });
});
