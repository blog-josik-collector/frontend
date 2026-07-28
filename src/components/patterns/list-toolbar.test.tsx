import { afterEach, describe, expect, it, vi } from 'vitest';

import { useState } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

import { FilterChip, ListToolbar } from './list-toolbar';

afterEach(cleanup);

function renderToolbar(overrides: Partial<React.ComponentProps<typeof ListToolbar>> = {}) {
  const onSearchValueChange = vi.fn();
  const onClearSearch = vi.fn();

  render(
    <ListToolbar
      filterContent={
        <DropdownMenuContent>
          <DropdownMenuItem>상태</DropdownMenuItem>
        </DropdownMenuContent>
      }
      filterCount={2}
      searchValue="react"
      onSearchValueChange={onSearchValueChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="게시글 검색"
      {...overrides}
    />,
  );

  return { onClearSearch, onSearchValueChange };
}

function SearchToolbar({ onSearchValueChange }: { onSearchValueChange: (value: string) => void }) {
  const [searchValue, setSearchValue] = useState('react');

  return (
    <ListToolbar
      filterContent={<DropdownMenuContent />}
      filterCount={2}
      searchValue={searchValue}
      onSearchValueChange={(value) => {
        setSearchValue(value);
        onSearchValueChange(value);
      }}
      onClearSearch={() => setSearchValue('')}
    />
  );
}

describe('ListToolbar', () => {
  it('announces the number of selected filters to assistive technology', () => {
    renderToolbar();

    expect(screen.getByRole('button', { name: '필터 2개 선택됨' })).toBeInTheDocument();
  });

  it('forwards entered search text to its consumer', async () => {
    const user = userEvent.setup();
    const onSearchValueChange = vi.fn();

    render(<SearchToolbar onSearchValueChange={onSearchValueChange} />);

    await user.type(screen.getByRole('textbox', { name: '검색' }), ' query');

    expect(onSearchValueChange).toHaveBeenLastCalledWith('react query');
  });

  it('clears the active search when requested', async () => {
    const user = userEvent.setup();
    const { onClearSearch } = renderToolbar();

    await user.click(screen.getByRole('button', { name: '검색어 지우기' }));

    expect(onClearSearch).toHaveBeenCalledOnce();
  });
});

describe('FilterChip', () => {
  it('provides an accessible action to remove its filter', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(<FilterChip label="승인 대기" onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: '승인 대기 필터 제거' }));

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
