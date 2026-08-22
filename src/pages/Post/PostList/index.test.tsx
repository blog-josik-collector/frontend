import { MemoryRouter, useLocation } from 'react-router';

import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PostList from './index';

const LocationSearch = () => {
  const location = useLocation();

  return <output aria-label="현재 검색 파라미터">{location.search}</output>;
};

const { fetchPostingsMock } = vi.hoisted(() => ({
  fetchPostingsMock: vi.fn(),
}));

vi.mock('@/stores/collect', () => ({
  useProviders: () => ({
    data: {
      items: [
        { providerId: 'provider-1', name: '테크 뉴스' },
        { providerId: 'provider-2', name: '디자인 소식' },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('@/stores/posting/postingStore', () => ({
  usePostingStore: () => ({
    fetchPostings: fetchPostingsMock,
    postings: { items: [], page: 0, size: 20, totalCount: 0 },
  }),
}));

beforeEach(() => {
  fetchPostingsMock.mockReset();
});

afterEach(cleanup);

it('uses URL search parameters for the initial request and filter highlight', async () => {
  render(
    <MemoryRouter initialEntries={['/?title=react&provider=디자인 소식']}>
      <PostList />
    </MemoryRouter>,
  );

  await waitFor(() =>
    expect(fetchPostingsMock).toHaveBeenCalledWith({
      page: 0,
      provider: '디자인 소식',
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
  expect(screen.getByRole('option', { name: '테크 뉴스' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: '디자인 소식' })).toBeInTheDocument();
  expect(screen.queryByRole('option', { name: 'Provider 1' })).not.toBeInTheDocument();

  await user.selectOptions(screen.getByRole('combobox', { name: '원본 출처' }), '디자인 소식');
  await user.click(screen.getByRole('button', { name: '검색' }));

  await waitFor(() =>
    expect(fetchPostingsMock).toHaveBeenLastCalledWith({
      page: 0,
      provider: '디자인 소식',
      size: 20,
      title: 'react',
    }),
  );
});

it('clears an unknown provider from the URL and keeps the other filters', async () => {
  render(
    <MemoryRouter initialEntries={['/?title=react&provider=임의값']}>
      <PostList />
      <LocationSearch />
    </MemoryRouter>,
  );

  await waitFor(() =>
    expect(screen.getByRole('status', { name: '현재 검색 파라미터' })).toHaveTextContent(
      '?title=react',
    ),
  );

  expect(screen.getByRole('status', { name: '현재 검색 파라미터' })).not.toHaveTextContent(
    'provider=',
  );
  expect(screen.getByRole('button', { name: '필터' })).toHaveAttribute('aria-pressed', 'false');
  expect(fetchPostingsMock).toHaveBeenLastCalledWith({
    page: 0,
    size: 20,
    title: 'react',
  });
  expect(fetchPostingsMock).not.toHaveBeenCalledWith(
    expect.objectContaining({ provider: '임의값' }),
  );
});
