import type { JSX } from 'react';

import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import PageLayout from './components/layout/PageLayout';
import SignLayout from './components/layout/SignLayout';
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

const rootRoute = createRootRoute();

// Sign layout route
const signLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'sign-layout',
  component: SignLayout,
});

// Auth routes
const signInRoute = createRoute({
  getParentRoute: () => signLayoutRoute,
  path: '/signin',
  component: SignIn,
});

const signUpRoute = createRoute({
  getParentRoute: () => signLayoutRoute,
  path: '/signup',
  component: SignUp,
});

// Page layout route
const pageLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'page-layout',
  component: PageLayout,
});

// Post routes
const postRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: '/',
  component: PostList,
});

const postDetailRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: '/post/$postId',
  component: PostDetail,
});

const myInfoRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: '/my/info',
  component: MyInfo,
});

const myFavoriteRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: '/my/favorite',
  component: MyFavorite,
});

const myBookmarkRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: '/my/bookmark',
  component: MyBookmark,
});

const managementProviderSettingRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: '/management/provider-setting',
  component: ManagementProviderSetting,
});

const managementReportPostRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: '/management/report/post',
  component: ManagementReportPost,
});

const managementReportCommentRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: '/management/report/comment',
  component: ManagementReportComment,
});

const routeTree = rootRoute.addChildren([
  signLayoutRoute.addChildren([signInRoute, signUpRoute]),
  pageLayoutRoute.addChildren([
    postRoute,
    postDetailRoute,
    myInfoRoute,
    myFavoriteRoute,
    myBookmarkRoute,
    managementProviderSettingRoute,
    managementReportPostRoute,
    managementReportCommentRoute,
  ]),
]);

export const router = createRouter({ routeTree });
