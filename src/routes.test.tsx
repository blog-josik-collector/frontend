import { MemoryRouter, RouterProvider } from 'react-router';

import { afterEach, describe, expect, it } from 'vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

import { navRoutes, router } from './routes';

import AppBar from '@/components/layout/AppBar';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AuthRole } from '@/services/auth';
import { renderWithI18n } from '@/test/i18n';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const toBase64Url = (value: object) =>
  btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const createAccessToken = (roles: AuthRole[]) =>
  `${toBase64Url({ alg: 'HS512' })}.${toBase64Url({
    authenticationId: 'authentication-id',
    exp: 2_000_000_000,
    iat: 1_900_000_000,
    iss: 'test-issuer',
    nickname: 'tester',
    roles,
    userId: 'user-id',
  })}.c2lnbmF0dXJl`;

const renderAppBar = (roles: AuthRole[] = []) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({
      addEventListener: () => undefined,
      matches: false,
      removeEventListener: () => undefined,
    }),
  });
  if (roles.length > 0) {
    localStorage.setItem('accessToken', createAccessToken(roles));
  }

  renderWithI18n(
    <MemoryRouter>
      <SidebarProvider>
        <AppBar />
      </SidebarProvider>
    </MemoryRouter>,
  );
};

describe('navRoutes', () => {
  it('inherits parent scopes on nested routes', () => {
    const management = navRoutes.find((route) => route.fullPath === '/management');
    const report = management?.children?.find((route) => route.fullPath === '/management/report');
    const reportPost = report?.children?.find(
      (route) => route.fullPath === '/management/report/post',
    );

    expect(reportPost?.scopes).toEqual(['admin']);
  });
});

describe('AppBar authorization', () => {
  it('shows only public navigation without a role', () => {
    renderAppBar();

    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.queryByText('마이')).not.toBeInTheDocument();
    expect(screen.queryByText('관리')).not.toBeInTheDocument();
  });

  it('shows navigation whose scope includes user for USER', () => {
    renderAppBar(['USER']);

    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('마이')).toBeInTheDocument();
    expect(screen.queryByText('관리')).not.toBeInTheDocument();
  });

  it('shows navigation whose scope includes admin for ADMIN', () => {
    renderAppBar(['ADMIN']);

    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('마이')).toBeInTheDocument();
    expect(screen.getByText('관리')).toBeInTheDocument();
  });
});

describe('route authorization', () => {
  it('redirects anonymous access to a protected route to sign in', async () => {
    await router.navigate('/my/info');

    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(router.state.location.pathname).toBe('/signin'));
  });

  it('redirects a signed-in USER away from an admin route', async () => {
    localStorage.setItem('accessToken', createAccessToken(['USER']));
    await router.navigate('/management/provider-setting');

    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });
});
