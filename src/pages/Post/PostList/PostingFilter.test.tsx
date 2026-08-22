import { afterEach, describe, expect, it, vi } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PostingFilter from './PostingFilter';

const providerOptions = [
  { label: '테크 뉴스', value: '테크 뉴스' },
  { label: '디자인 소식', value: '디자인 소식' },
];

afterEach(cleanup);

describe('PostingFilter', () => {
  it('toggles the inline provider filter with the filter button', async () => {
    const user = userEvent.setup();

    render(
      <PostingFilter
        search=""
        selected={[]}
        providerOptions={providerOptions}
        onSubmit={vi.fn()}
      />,
    );

    const filterButton = screen.getByRole('button', { name: '필터' });

    expect(screen.queryByRole('combobox', { name: '원본 출처' })).not.toBeInTheDocument();

    await user.click(filterButton);

    expect(screen.getByRole('combobox', { name: '원본 출처' })).toBeInTheDocument();
    expect(filterButton).toHaveAttribute('aria-expanded', 'true');

    await user.click(filterButton);

    expect(screen.queryByRole('combobox', { name: '원본 출처' })).not.toBeInTheDocument();
    expect(filterButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('applies drafts together only when search is submitted and then collapses', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <PostingFilter
        search=""
        selected={[]}
        providerOptions={providerOptions}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByRole('textbox', { name: '제목 검색' }), ' react ');
    await user.click(screen.getByRole('button', { name: '필터' }));
    await user.selectOptions(screen.getByRole('combobox', { name: '원본 출처' }), '디자인 소식');

    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({ search: 'react', provider: '디자인 소식' });
    expect(screen.queryByRole('combobox', { name: '원본 출처' })).not.toBeInTheDocument();
  });

  it('highlights the filter button when an applied provider exists', () => {
    render(
      <PostingFilter
        search=""
        selected={['테크 뉴스']}
        providerOptions={providerOptions}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '필터 1' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps the draft when the parent rerenders with the same applied values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { rerender } = render(
      <PostingFilter
        search="applied"
        selected={['테크 뉴스']}
        providerOptions={providerOptions}
        onSubmit={onSubmit}
      />,
    );

    const searchInput = screen.getByRole('textbox', { name: '제목 검색' });
    await user.clear(searchInput);
    await user.type(searchInput, 'draft');

    rerender(
      <PostingFilter
        search="applied"
        selected={['테크 뉴스']}
        providerOptions={providerOptions}
        onSubmit={onSubmit}
      />,
    );

    expect(searchInput).toHaveValue('draft');
  });
});
