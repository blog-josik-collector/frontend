import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import PageLayout from './components/layout/PageLayout';
import PostDetail from './pages/Post/PostDetail';
import PostList from './pages/Post/PostList';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

const rootRoute = createRootRoute({
  component: PageLayout,
});

const postRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PostList,
});

const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/post/$postId',
  component: PostDetail,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signin',
  component: SignIn,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUp,
});

const routeTree = rootRoute.addChildren([postRoute, postDetailRoute, signInRoute, signUpRoute]);

export const router = createRouter({ routeTree });
