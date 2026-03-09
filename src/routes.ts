import type { JSX } from 'react';

import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import PageLayout from './components/layout/PageLayout';
import ManagementProviderSetting from './pages/Management/ProviderSetting';
import ManagementReportComment from './pages/Management/Report/Comment';
import ManagementReportPost from './pages/Management/Report/Post';
import MyBookmark from './pages/My/Bookmark';
import MyFavorite from './pages/My/Favorite';
import MyInfo from './pages/My/Info';
import PostDetail from './pages/Post/PostDetail';
import PostList from './pages/Post/PostList';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

export interface NavRoute {
  path: string;
  label: string;
  children?: NavRoute[];
}

export const navRoutes: NavRoute[] = [
  { path: '/', label: 'Home' },
  {
    path: '/my',
    label: 'My',
    children: [
      { path: '/my/info', label: 'My Info' },
      { path: '/my/favorite', label: 'My Favorite' },
      { path: '/my/bookmark', label: 'My Bookmark' },
    ],
  },
  {
    path: '/management',
    label: 'Management',
    children: [
      { path: '/management/report/post', label: 'Report Post' },
      {
        path: '/management/report/comment',
        label: 'Report Comment',
      },
      {
        path: '/management/provider-setting',
        label: 'Provider Setting',
      },
    ],
  },
];

// Root route with layout
const rootRoute = createRootRoute({
  component: PageLayout,
});

// Auth routes
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

// Post routes
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

const myInfoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my/info',
  component: MyInfo,
});

const myFavoriteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my/favorite',
  component: MyFavorite,
});

const myBookmarkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my/bookmark',
  component: MyBookmark,
});

const managementProviderSettingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/management/provider-setting',
  component: ManagementProviderSetting,
});

const managementReportPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/management/report/post',
  component: ManagementReportPost,
});

const managementReportCommentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/management/report/comment',
  component: ManagementReportComment,
});

const routeTree = rootRoute.addChildren([
  signInRoute,
  signUpRoute,
  postRoute,
  postDetailRoute,
  myInfoRoute,
  myFavoriteRoute,
  myBookmarkRoute,
  managementProviderSettingRoute,
  managementReportPostRoute,
  managementReportCommentRoute,
]);

export const router = createRouter({ routeTree });
