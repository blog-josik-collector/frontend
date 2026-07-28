import * as React from 'react';

import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface ListToolbarProps {
  filterContent: React.ReactNode;
  filterCount: number;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onClearSearch: () => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function ListToolbar({
  filterContent,
  filterCount,
  searchValue,
  onSearchValueChange,
  onClearSearch,
  searchPlaceholder,
  children,
}: ListToolbarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-background focus-within:ring-ring flex items-center rounded-2xl border focus-within:ring-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" aria-label={`필터 ${filterCount}개 선택됨`}>
              <FilterIcon />
              필터
              {filterCount > 0 && <span>{filterCount}</span>}
            </Button>
          </DropdownMenuTrigger>
          {filterContent}
        </DropdownMenu>
        <div className="bg-border mx-1 h-5 w-px" />
        <SearchIcon className="text-muted-foreground ml-2 size-4" />
        <Input
          value={searchValue}
          onChange={(event) => onSearchValueChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label="검색"
          className="flex-1 border-0 shadow-none focus-visible:ring-0"
        />
        {searchValue && (
          <Button variant="ghost" size="icon-sm" aria-label="검색어 지우기" onClick={onClearSearch}>
            <XIcon />
          </Button>
        )}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
      {label}
      <Button variant="ghost" size="icon-xs" aria-label={`${label} 필터 제거`} onClick={onRemove}>
        <XIcon />
      </Button>
    </span>
  );
}

export { FilterChip, ListToolbar };
export type { FilterChipProps, ListToolbarProps };
