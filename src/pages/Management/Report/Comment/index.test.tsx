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
          commentContent: 'Original comment',
          content: 'political',
          createdAt: Date.parse('2026-08-22T00:00:00Z'),
          id: 'report-1',
          nickname: 'reporter',
          reportType: 'political',
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

it('renders the comment content and reporter nickname from the current report resource', () => {
  render(<CommentReport />);

  expect(screen.getByRole('columnheader', { name: '댓글 내용' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: '신고자 닉네임' })).toBeInTheDocument();
  expect(screen.getByText('Original comment')).toBeInTheDocument();
  expect(screen.getByText('reporter')).toBeInTheDocument();
});

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

it('applies inline report filters only when search is submitted', async () => {
  const user = userEvent.setup();
  render(<CommentReport />);

  const filterButton = screen.getByRole('button', { name: '필터' });

  expect(screen.queryByRole('combobox', { name: '신고 유형' })).not.toBeInTheDocument();

  await user.click(filterButton);
  await user.selectOptions(screen.getByRole('combobox', { name: '신고 유형' }), 'political');

  expect(filterButton).toHaveAccessibleName('필터');

  await user.click(screen.getByRole('button', { name: '검색' }));

  expect(screen.queryByRole('combobox', { name: '신고 유형' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '필터 1' })).toHaveAttribute('aria-pressed', 'true');
});
