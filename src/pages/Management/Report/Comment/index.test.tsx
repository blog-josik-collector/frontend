import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CommentReport } from './index';

const { mutateMock } = vi.hoisted(() => ({ mutateMock: vi.fn() }));

vi.mock('@/stores/reports/commentReportsStore', () => ({
  useAdminCommentReports: () => ({
    data: {
      items: [
        {
          commentId: 'comment-1',
          content: 'political',
          createdAt: Date.parse('2026-08-22T00:00:00Z'),
          id: 'report-1',
          reportType: 'political',
          reporterId: 'user-1',
          status: 'pending',
          updatedAt: Date.parse('2026-08-22T01:00:00Z'),
        },
      ],
      page: 0,
      size: 20,
      totalCount: 1,
    },
    isError: false,
    isLoading: false,
  }),
  useUpdateAdminCommentReportStatus: () => ({ isPending: false, mutate: mutateMock }),
}));

beforeEach(() => mutateMock.mockReset());
afterEach(cleanup);

it('can reject a report while keeping the comment', async () => {
  const user = userEvent.setup();
  render(<CommentReport />);

  await user.click(screen.getByRole('button', { name: '메뉴 열기' }));
  await user.click(screen.getByRole('menuitem', { name: '신고 반려·댓글 유지' }));

  expect(mutateMock).toHaveBeenCalledWith({
    body: { status: 'rejected_keep' },
    reportId: 'report-1',
  });
});
