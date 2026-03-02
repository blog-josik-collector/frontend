import React from 'react';

import { ArrowLeftIcon, ArrowRightIcon, BadgeCheckIcon, ChevronRightIcon } from 'lucide-react';

import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
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

interface ItemCardProps {
  title: string;
  description: string;
  updateTs: number;
  onClick: () => void;
}
const ItemCard: React.FC<ItemCardProps> = ({ title, description, updateTs, onClick }) => {
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

const PostList = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">선택</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40" align="start">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                토스
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                카카오
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Input placeholder="Enter text" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((_, index) => (
          <ItemCard
            key={index}
            title={`Item ${index + 1}`}
            description={`Description for item ${index + 1}`}
            updateTs={new Date().valueOf()}
            onClick={() => {
              navigate({ to: '/post/$postId', params: { postId: index.toString() } });
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
