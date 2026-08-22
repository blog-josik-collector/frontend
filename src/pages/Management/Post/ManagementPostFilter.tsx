import { useEffect, useState } from 'react';

import InlineFilter from '../InlineFilter';

const FILTER_OPTIONS = ['토스', '카카오', '네이버', '라인'] as const;

export type FilterOption = (typeof FILTER_OPTIONS)[number];

interface ManagementPostFilterValue {
  search: string;
  category?: FilterOption;
}

interface ManagementPostFilterProps {
  search: string;
  category?: FilterOption;
  onSubmit: (value: ManagementPostFilterValue) => void;
}

function ManagementPostFilter({ search, category, onSubmit }: ManagementPostFilterProps) {
  const [draftCategory, setDraftCategory] = useState<FilterOption | ''>(category ?? '');

  useEffect(() => {
    setDraftCategory(category ?? '');
  }, [category]);

  return (
    <InlineFilter
      filterCount={category ? 1 : 0}
      search={search}
      searchLabel="게시물 검색"
      searchPlaceholder="검색어를 입력하세요"
      onSubmit={(nextSearch) =>
        onSubmit({
          search: nextSearch,
          ...(draftCategory ? { category: draftCategory } : {}),
        })
      }
    >
      <div className="min-w-48 space-y-1.5">
        <label htmlFor="management-post-category-filter" className="text-sm font-medium">
          카테고리 선택
        </label>
        <select
          id="management-post-category-filter"
          value={draftCategory}
          onChange={(event) => setDraftCategory(event.target.value as FilterOption | '')}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
        >
          <option value="">전체</option>
          {FILTER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground h-9 text-xs disabled:opacity-50"
        onClick={() => setDraftCategory('')}
        disabled={!draftCategory}
      >
        선택 초기화
      </button>
    </InlineFilter>
  );
}

export default ManagementPostFilter;
