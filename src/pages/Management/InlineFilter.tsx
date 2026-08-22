import { type FormEvent, type ReactNode, useEffect, useState } from 'react';

import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InlineFilterProps {
  children: ReactNode;
  contentClassName?: string;
  filterCount: number;
  search: string;
  searchLabel: string;
  searchPlaceholder: string;
  onSubmit: (search: string) => void;
}

function InlineFilter({
  children,
  contentClassName,
  filterCount,
  search,
  searchLabel,
  searchPlaceholder,
  onSubmit,
}: InlineFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draftSearch, setDraftSearch] = useState(search);
  const hasAppliedFilter = filterCount > 0;

  useEffect(() => {
    setDraftSearch(search);
  }, [search]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(draftSearch.trim());
    setIsExpanded(false);
  };

  return (
    <form
      className="bg-background focus-within:ring-ring overflow-hidden rounded-2xl border shadow-sm transition-shadow focus-within:ring-2"
      onSubmit={handleSubmit}
    >
      <div className="flex min-w-0 items-center p-1">
        <button
          type="button"
          aria-label={hasAppliedFilter ? `필터 ${filterCount}` : '필터'}
          aria-expanded={isExpanded}
          aria-pressed={hasAppliedFilter}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className={cn(
            'hover:text-foreground flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm transition-colors',
            hasAppliedFilter ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground',
          )}
        >
          <FilterIcon className="size-4" />
          <span>필터</span>
          {hasAppliedFilter && (
            <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs font-medium">
              {filterCount}
            </span>
          )}
        </button>

        <div className="bg-border mx-1 h-5 w-px shrink-0" />
        <span className="text-muted-foreground pl-2">
          <SearchIcon className="size-4" />
        </span>
        <Input
          aria-label={searchLabel}
          className="min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
          placeholder={searchPlaceholder}
          value={draftSearch}
          onChange={(event) => setDraftSearch(event.target.value)}
        />
        {draftSearch && (
          <button
            type="button"
            aria-label="검색어 지우기"
            className="text-muted-foreground hover:text-foreground px-2"
            onClick={() => setDraftSearch('')}
          >
            <XIcon className="size-4" />
          </button>
        )}
        {!isExpanded && (
          <Button type="submit" className="shrink-0">
            검색
          </Button>
        )}
      </div>

      {isExpanded && (
        <div
          className={cn(
            'border-border flex flex-wrap items-end gap-3 border-t px-4 py-3',
            contentClassName,
          )}
        >
          {children}
          <Button type="submit" className="ml-auto shrink-0">
            검색
          </Button>
        </div>
      )}
    </form>
  );
}

export default InlineFilter;
