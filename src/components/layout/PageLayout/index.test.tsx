import { MemoryRouter, Route, Routes } from 'react-router';

import { afterEach, expect, it, vi } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';

import PageLayout from './index';

vi.mock('../AppBar', () => ({ default: () => <aside>App bar</aside> }));
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }));

afterEach(cleanup);

it('provides an accessible link to the home page next to the sidebar trigger', () => {
  render(
    <MemoryRouter initialEntries={['/my/info']}>
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/my/info" element={<div>My info</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

  expect(screen.getByRole('button', { name: 'Toggle Sidebar' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '홈으로 이동' })).toHaveAttribute('href', '/');
});
