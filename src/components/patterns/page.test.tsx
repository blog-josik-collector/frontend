import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import {
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/patterns/page';

describe('page composition primitives', () => {
  it('renders detail content with a standard title and description', () => {
    render(
      <PageContent variant="detail" data-testid="content">
        <PageHeader>
          <div>
            <PageTitle>게시물 상세</PageTitle>
            <PageDescription>게시물 정보를 확인합니다.</PageDescription>
          </div>
        </PageHeader>
      </PageContent>,
    );

    expect(screen.getByTestId('content')).toHaveClass('max-w-4xl');
    expect(screen.getByRole('heading', { level: 1, name: '게시물 상세' })).toHaveClass(
      'text-xl',
    );
    expect(screen.getByText('게시물 정보를 확인합니다.')).toHaveClass(
      'text-muted-foreground',
    );
  });

  it('renders management titles with the management visual hierarchy', () => {
    render(<PageTitle level="management">관리</PageTitle>);

    expect(screen.getByRole('heading', { level: 1, name: '관리' })).toHaveClass(
      'text-2xl',
      'font-bold',
    );
  });
});
