import React from 'react';

import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const FILTER_OPTIONS = ['토스', '카카오', '네이버', '라인'] as const;
export type FilterOption = (typeof FILTER_OPTIONS)[number];

interface PostingFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  selected: FilterOption[];
  onSelectedChange: (options: FilterOption[]) => void;
}

const PostingFilter: React.FC<PostingFilterProps> = ({
  search,
  onSearchChange,
  selected,
  onSelectedChange,
}) => {
  const toggleOption = (option: FilterOption) => {
    onSelectedChange(
      selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option],
    );
  };

  return (
    <>
      {/* 통합 필터 */}
      <div className="bg-background focus-within:ring-ring flex items-center rounded-xl border shadow-sm focus-within:ring-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-2 text-sm transition-colors">
              <FilterIcon className="size-4" />
              <span>필터</span>
              {selected.length > 0 && (
                <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs font-medium">
                  {selected.length}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44" align="start">
            <DropdownMenuLabel>카테고리 선택</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {FILTER_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  checked={selected.includes(option)}
                  onCheckedChange={() => toggleOption(option)}
                >
                  {option}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
            {selected.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <button
                  className="text-muted-foreground hover:text-foreground w-full px-3 py-2 text-left text-xs transition-colors"
                  onClick={() => onSelectedChange([])}
                >
                  선택 초기화
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="bg-border mx-1 h-5 w-px" />
        <span className="text-muted-foreground pl-2">
          <SearchIcon className="size-4" />
        </span>
        <Input
          className="flex-1 border-0 shadow-none focus-visible:ring-0"
          placeholder="검색어를 입력하세요"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            className="text-muted-foreground hover:text-foreground pr-3"
            onClick={() => onSearchChange('')}
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>
      {/* 선택된 필터 태그 */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((option) => (
            <span
              key={option}
              className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
            >
              {option}
              <button onClick={() => toggleOption(option)} className="hover:opacity-70">
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default PostingFilter;
export { FILTER_OPTIONS };
