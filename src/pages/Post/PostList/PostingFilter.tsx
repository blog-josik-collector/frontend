import React, { useEffect, useState } from 'react';

import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const FILTER_OPTIONS = [
  { label: 'Provider 1', value: 'provider-1' },
  { label: 'Provider 2', value: 'provider-2' },
  { label: 'Provider 3', value: 'provider-3' },
] as const;

export type FilterOption = (typeof FILTER_OPTIONS)[number]['value'];

export interface PostingFilterValue {
  search: string;
  providerId?: FilterOption;
}

interface PostingFilterProps {
  search: string;
  selected: FilterOption[];
  onSubmit: (value: PostingFilterValue) => void;
}

const PostingFilter: React.FC<PostingFilterProps> = ({ search, selected, onSubmit }) => {
  const appliedProviderId = selected[0];
  const [isExpanded, setIsExpanded] = useState(false);
  const [draftSearch, setDraftSearch] = useState(search);
  const [draftProviderId, setDraftProviderId] = useState<FilterOption | ''>(
    appliedProviderId ?? '',
  );
  const hasAppliedFilter = selected.length > 0;

  useEffect(() => {
    setDraftSearch(search);
    setDraftProviderId(appliedProviderId ?? '');
  }, [search, appliedProviderId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      search: draftSearch.trim(),
      ...(draftProviderId ? { providerId: draftProviderId } : {}),
    });
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
          aria-label={hasAppliedFilter ? `필터 ${selected.length}` : '필터'}
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
              {selected.length}
            </span>
          )}
        </button>

        <div className="bg-border mx-1 h-5 w-px shrink-0" />
        <span className="text-muted-foreground pl-2">
          <SearchIcon className="size-4" />
        </span>
        <Input
          aria-label="제목 검색"
          className="min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
          placeholder="검색어를 입력하세요"
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
        <div className="border-border flex flex-wrap items-end gap-3 border-t px-4 py-3">
          <div className="min-w-48 space-y-1.5">
            <label htmlFor="posting-provider-filter" className="text-sm font-medium">
              원본 출처
            </label>
            <select
              id="posting-provider-filter"
              value={draftProviderId}
              onChange={(event) => setDraftProviderId(event.target.value as FilterOption | '')}
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
            >
              <option value="">전체</option>
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground h-9 text-xs disabled:opacity-50"
            onClick={() => setDraftProviderId('')}
            disabled={!draftProviderId}
          >
            선택 초기화
          </button>
          <Button type="submit" className="ml-auto shrink-0">
            검색
          </Button>
        </div>
      )}
    </form>
  );
};

const isFilterOption = (value: string | null): value is FilterOption =>
  FILTER_OPTIONS.some((option) => option.value === value);

export default PostingFilter;
export { FILTER_OPTIONS, isFilterOption };
