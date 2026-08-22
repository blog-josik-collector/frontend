import { MemoryRouter } from 'react-router';

import { afterEach, expect, it } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ManagementPost from './index';

afterEach(cleanup);

it('applies the inline category filter only when search is submitted', async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <ManagementPost />
    </MemoryRouter>,
  );

  const filterButton = screen.getByRole('button', { name: '필터' });

  expect(screen.queryByRole('combobox', { name: '카테고리 선택' })).not.toBeInTheDocument();

  await user.click(filterButton);
  await user.selectOptions(screen.getByRole('combobox', { name: '카테고리 선택' }), '카카오');

  expect(filterButton).toHaveAccessibleName('필터');

  await user.click(screen.getByRole('button', { name: '검색' }));

  expect(screen.queryByRole('combobox', { name: '카테고리 선택' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '필터 1' })).toHaveAttribute('aria-pressed', 'true');
});
