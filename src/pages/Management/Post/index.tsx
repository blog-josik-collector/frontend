import React, { useState } from 'react';
import { useNavigate } from 'react-router';

import { ArrowLeftIcon, ArrowRightIcon, BadgeCheckIcon } from 'lucide-react';

import ManagementPostFilter, { type FilterOption } from './ManagementPostFilter';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';

interface ItemCardProps {
  title: string;
  updateTs: number;
  onClick: () => void;
}
const ItemCard: React.FC<ItemCardProps> = ({ title, updateTs, onClick }) => {
  return (
    <Item className="border-black-2 hover:cursor-pointer" onClick={onClick}>
      <ItemMedia variant="icon">
        <BadgeCheckIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{updateTs}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button onClick={onClick}>수정</Button>
      </ItemActions>
    </Item>
  );
};

const ManagementPost = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FilterOption>();

  return (
    <div className="flex flex-col gap-4 p-4">
      <ManagementPostFilter
        search={search}
        category={category}
        onSubmit={({ search: nextSearch, category: nextCategory }) => {
          setSearch(nextSearch);
          setCategory(nextCategory);
        }}
      />
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((_, index) => (
          <ItemCard
            key={index}
            title={`Item ${index + 1}`}
            updateTs={new Date().valueOf()}
            onClick={() => {
              navigate({ pathname: '/post', search: `?post-id=${index}` });
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

export default ManagementPost;
