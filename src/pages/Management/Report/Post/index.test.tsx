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
    },
    isError: false,
    isLoading: false,
  }),
  useUpdateAdminPostingReportStatus: () => ({ isPending: false, mutate: mutateMock }),
}));

beforeEach(() => mutateMock.mockReset());
afterEach(cleanup);

it('renders the posting title and reporter nickname from the current report resource', () => {
  render(<PostReport />);

  expect(screen.getByRole('columnheader', { name: '제목' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: '신고자 닉네임' })).toBeInTheDocument();
  expect(screen.getByText('Reported post title')).toBeInTheDocument();
  expect(screen.getByText('reporter')).toBeInTheDocument();
});

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

it('applies inline report filters only when search is submitted', async () => {
  const user = userEvent.setup();
  render(<PostReport />);

  const filterButton = screen.getByRole('button', { name: '필터' });

  expect(screen.queryByRole('combobox', { name: '신고 유형' })).not.toBeInTheDocument();

  await user.click(filterButton);
  await user.selectOptions(screen.getByRole('combobox', { name: '신고 유형' }), 'invalid_content');

  expect(filterButton).toHaveAccessibleName('필터');

  await user.click(screen.getByRole('button', { name: '검색' }));

  expect(screen.queryByRole('combobox', { name: '신고 유형' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '필터 1' })).toHaveAttribute('aria-pressed', 'true');
});
