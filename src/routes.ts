import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';

import PageLayout from './components/layout/PageLayout';
import Home from './pages/Home';

const rootRoute = createRootRoute({
  component: PageLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const routeTree = rootRoute.addChildren([homeRoute]);

export const router = createRouter({ routeTree });
