import { MemoryRouter } from 'react-router';

import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PostList from './index';

const { fetchPostingsMock } = vi.hoisted(() => ({
  fetchPostingsMock: vi.fn(),
}));

vi.mock('@/stores/posting/postingStore', () => ({
  usePostingStore: () => ({
    fetchPostings: fetchPostingsMock,
    postings: { items: [], total: 0 },
  }),
}));

beforeEach(() => {
  fetchPostingsMock.mockReset();
});

afterEach(cleanup);

it('uses URL search parameters for the initial request and filter highlight', async () => {
  render(
    <MemoryRouter initialEntries={['/?title=react&provider_id=provider-2']}>
      <PostList />
    </MemoryRouter>,
  );

  await waitFor(() =>
    expect(fetchPostingsMock).toHaveBeenCalledWith({
      page: 0,
      provider_id: 'provider-2',
      size: 20,
      title: 'react',
    }),
  );

  expect(screen.getByRole('button', { name: '필터 1' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('textbox', { name: '제목 검색' })).toHaveValue('react');
});

it('applies the title and provider to the request together', async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <PostList />
    </MemoryRouter>,
  );

  await waitFor(() => expect(fetchPostingsMock).toHaveBeenCalled());

  await user.type(screen.getByRole('textbox', { name: '제목 검색' }), 'react');
  await user.click(screen.getByRole('button', { name: '필터' }));
  await user.selectOptions(screen.getByRole('combobox', { name: '원본 출처' }), 'provider-2');
  await user.click(screen.getByRole('button', { name: '검색' }));

  await waitFor(() =>
    expect(fetchPostingsMock).toHaveBeenLastCalledWith({
      page: 0,
      provider_id: 'provider-2',
      size: 20,
      title: 'react',
    }),
  );
});
