import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PostReport } from './index';

const { mutateMock } = vi.hoisted(() => ({ mutateMock: vi.fn() }));

vi.mock('@/stores/reports/postingReportsStore', () => ({
  useAdminPostingReports: () => ({
    data: {
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
    },
    isError: false,
    isLoading: false,
  }),
  useUpdateAdminPostingReportStatus: () => ({ isPending: false, mutate: mutateMock }),
}));

beforeEach(() => mutateMock.mockReset());
afterEach(cleanup);

it('can reject a report while keeping the posting', async () => {
  const user = userEvent.setup();
  render(<PostReport />);

  await user.click(screen.getByRole('button', { name: '메뉴 열기' }));
  await user.click(screen.getByRole('menuitem', { name: '신고 반려·게시글 유지' }));

  expect(mutateMock).toHaveBeenCalledWith({
    body: { status: 'rejected_keep' },
    reportId: 'report-1',
  });
});
