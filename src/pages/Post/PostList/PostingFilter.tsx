import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface ProviderFilterOption {
  label: string;
  value: string;
}

export interface PostingFilterValue {
  search: string;
  provider?: string;
}

interface PostingFilterProps {
  search: string;
  selected: string[];
  providerOptions: ProviderFilterOption[];
  isProviderLoading?: boolean;
  onSubmit: (value: PostingFilterValue) => void;
}

const PostingFilter: React.FC<PostingFilterProps> = ({
  search,
  selected,
  providerOptions,
  isProviderLoading = false,
  onSubmit,
}) => {
  const { t } = useTranslation('common');
  const appliedProviderId = selected[0];
  const [isExpanded, setIsExpanded] = useState(false);
  const [draftSearch, setDraftSearch] = useState(search);
  const [draftProvider, setDraftProvider] = useState(appliedProviderId ?? '');
  const hasAppliedFilter = selected.length > 0;

  useEffect(() => {
    setDraftSearch(search);
    setDraftProvider(appliedProviderId ?? '');
  }, [search, appliedProviderId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      search: draftSearch.trim(),
      ...(draftProvider ? { provider: draftProvider } : {}),
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
          aria-label={
            hasAppliedFilter ? t('filterWithCount', { count: selected.length }) : t('filter')
          }
          aria-expanded={isExpanded}
          aria-pressed={hasAppliedFilter}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className={cn(
            'hover:text-foreground flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm transition-colors',
            hasAppliedFilter ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground',
          )}
        >
          <FilterIcon className="size-4" />
          <span>{t('filter')}</span>
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
          aria-label={t('searchTitle')}
          className="min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
          placeholder={t('searchPlaceholder')}
          value={draftSearch}
          onChange={(event) => setDraftSearch(event.target.value)}
        />
        {draftSearch && (
          <button
            type="button"
            aria-label={t('clearSearch')}
            className="text-muted-foreground hover:text-foreground px-2"
            onClick={() => setDraftSearch('')}
          >
            <XIcon className="size-4" />
          </button>
        )}
        {!isExpanded && (
          <Button type="submit" className="shrink-0">
            {t('search')}
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="border-border flex flex-wrap items-end gap-3 border-t px-4 py-3">
          <div className="min-w-48 space-y-1.5">
            <label htmlFor="posting-provider-filter" className="text-sm font-medium">
              {t('providerSource')}
            </label>
            <select
              id="posting-provider-filter"
              value={draftProvider}
              onChange={(event) => setDraftProvider(event.target.value)}
              disabled={isProviderLoading}
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
            >
              <option value="">{t('all')}</option>
              {providerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground h-9 text-xs disabled:opacity-50"
            onClick={() => setDraftProvider('')}
            disabled={!draftProvider}
          >
            {t('resetSelection')}
          </button>
          <Button type="submit" className="ml-auto shrink-0">
            {t('search')}
          </Button>
        </div>
      )}
    </form>
  );
};

export default PostingFilter;
