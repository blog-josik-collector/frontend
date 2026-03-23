import React, { useState } from 'react';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  EyeIcon,
  FilterIcon,
  HeartIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';

import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

interface ItemCardProps {
  title: string;
  updateTs: number;
  likeCount: number;
  viewCount: number;
  onClick: () => void;
}
const ItemCard: React.FC<ItemCardProps> = ({ title, updateTs, likeCount, viewCount, onClick }) => {
  return (
    <Item className="border-black-2 hover:cursor-pointer" onClick={onClick}>
      <ItemMedia variant="icon">
        <BadgeCheckIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{formatDate(updateTs)}</ItemDescription>
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

const MOCK_POSTS = Array.from({ length: 7 }, (_, i) => ({
  id: i,
  title: `Item ${i + 1}`,
  updateTs: new Date().valueOf(),
  likeCount: [312, 87, 1540, 56, 903, 210, 445][i],
  viewCount: [8230, 1045, 9870, 340, 5610, 2780, 6120][i],
}));

const FILTER_OPTIONS = ['토스', '카카오', '네이버', '라인'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

const PostList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FilterOption[]>([]);

  const toggleOption = (option: FilterOption) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4">
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
                  onClick={() => setSelected([])}
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
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="text-muted-foreground hover:text-foreground pr-3"
            onClick={() => setSearch('')}
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
      <div className="flex flex-wrap gap-2">
        {MOCK_POSTS.map((post) => (
          <ItemCard
            key={post.id}
            title={post.title}
            updateTs={post.updateTs}
            likeCount={post.likeCount}
            viewCount={post.viewCount}
            onClick={() => {
              navigate({ pathname: '/post', search: `?post-id=${post.id}` });
            }}
          />
        ))}
      </div>
      <div className="flex justify-center">
        <ButtonGroup aria-label="Button group">
          <Button variant="secondary">
            <ArrowLeftIcon />
          </Button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, index) => (
            <Button variant="secondary" key={index}>
              {index + 1}
            </Button>
          ))}
          <Button variant="secondary">
            <ArrowRightIcon />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default PostList;
