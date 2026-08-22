import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import dayjs from 'dayjs';
import { ArrowLeftIcon, ArrowRightIcon, BadgeCheckIcon, EyeIcon, HeartIcon } from 'lucide-react';

import PostingFilter from './PostingFilter';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { useProviders } from '@/stores/collect';
import { usePostingStore } from '@/stores/posting/postingStore';

const paginationOptions = [10, 20, 50, 100];
const defaultPagination = paginationOptions[1];
const pageBlockSize = 10;

interface ItemCardProps {
  title: string;
  publishedAt: number;
  likeCount: number;
  viewCount: number;
  onClick: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  title,
  publishedAt,
  likeCount,
  viewCount,
  onClick,
}) => {
  return (
    <Item className="border-black-2 hover:cursor-pointer" onClick={onClick}>
      <ItemMedia variant="icon">
        <BadgeCheckIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{dayjs(publishedAt).format('YYYY-MM-DD')}</ItemDescription>
      </ItemContent>
      <ItemActions className="text-muted-foreground">
        <span className="flex items-center gap-1 text-xs">
          <HeartIcon className="size-3.5" />
          {likeCount.toLocaleString()}
        </span>
        <span className="flex items-center gap-1 text-xs">
          <EyeIcon className="size-3.5" />
          {viewCount.toLocaleString()}
        </span>
      </ItemActions>
    </Item>
  );
};

const PostList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPagination);
  const { postings, fetchPostings } = usePostingStore();
  const providers = useProviders({ page: 0, size: 100 });
  const search = searchParams.get('title') ?? '';
  const requestedProvider = searchParams.get('provider') || undefined;
  const providerItems = providers.data?.items;
  const providerNames = useMemo(
    () => Array.from(new Set((providerItems ?? []).map((provider) => provider.name))),
    [providerItems],
  );
  const canValidateProvider = providerItems !== undefined;
  const isRequestedProviderValid = requestedProvider
    ? providerNames.includes(requestedProvider)
    : false;
  const isWaitingForProvider =
    Boolean(requestedProvider) && !canValidateProvider && !providers.isError;
  const isInvalidProvider =
    Boolean(requestedProvider) && canValidateProvider && !isRequestedProviderValid;
  const selectedProvider = isRequestedProviderValid
    ? requestedProvider
    : providers.isError
      ? requestedProvider
      : undefined;
  const selected = selectedProvider ? [selectedProvider] : [];
  const providerOptions = providerNames.map((name) => ({ label: name, value: name }));

  const totalPages = Math.max(1, Math.ceil(postings.totalCount / pageSize));
  const currentBlockStart = Math.floor((page - 1) / pageBlockSize) * pageBlockSize + 1;
  const pageNumbers = Array.from(
    { length: Math.min(pageBlockSize, totalPages - currentBlockStart + 1) },
    (_, index) => currentBlockStart + index,
  );

  useEffect(() => {
    if (!requestedProvider || !isInvalidProvider) return;

    setSearchParams(
      (currentSearchParams) => {
        const nextSearchParams = new URLSearchParams(currentSearchParams);
        nextSearchParams.delete('provider');
        return nextSearchParams;
      },
      { replace: true },
    );
  }, [isInvalidProvider, requestedProvider, setSearchParams]);

  useEffect(() => {
    if (isWaitingForProvider || isInvalidProvider) return;

    fetchPostings({
      page: page - 1,
      size: pageSize,
      title: search || undefined,
      ...(selectedProvider ? { provider: selectedProvider } : {}),
    });
  }, [
    fetchPostings,
    isInvalidProvider,
    isWaitingForProvider,
    page,
    pageSize,
    search,
    selectedProvider,
  ]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <PostingFilter
        search={search}
        selected={selected}
        providerOptions={providerOptions}
        isProviderLoading={providers.isLoading}
        onSubmit={({ search: nextSearch, provider }) => {
          setSearchParams((currentSearchParams) => {
            const nextSearchParams = new URLSearchParams(currentSearchParams);

            if (nextSearch) {
              nextSearchParams.set('title', nextSearch);
            } else {
              nextSearchParams.delete('title');
            }

            if (provider) {
              nextSearchParams.set('provider', provider);
            } else {
              nextSearchParams.delete('provider');
            }

            return nextSearchParams;
          });
          setPage(1);
        }}
      />
      <div className="text-muted-foreground text-sm">
        총 {postings.totalCount.toLocaleString()}개 · {totalPages} 페이지
      </div>
      <div className="flex flex-wrap gap-2">
        {postings.items.map((post) => (
          <ItemCard
            key={post.id}
            title={post.title}
            publishedAt={post.publishedAt}
            likeCount={post.social.likeCount}
            viewCount={post.social.viewCount}
            onClick={() => {
              navigate({ pathname: '/post', search: `?post-id=${post.id}` });
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div />
        <ButtonGroup aria-label="Button group">
          <Button
            variant="secondary"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <ArrowLeftIcon />
          </Button>
          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? 'secondary' : 'outline'}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <Button
            variant="secondary"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            <ArrowRightIcon />
          </Button>
        </ButtonGroup>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {pageSize}개
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>페이지당 항목</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={String(pageSize)}
              onValueChange={(value) => {
                const selectedSize = Number(value);
                setPageSize(selectedSize);
                setPage(1);
              }}
            >
              {paginationOptions.map((option) => (
                <DropdownMenuRadioItem key={option} value={String(option)}>
                  {option}개
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default PostList;
