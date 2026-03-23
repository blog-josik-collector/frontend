import React from 'react';
import { createBrowserRouter, type RouteObject, useNavigate } from 'react-router';

import PageLayout from './components/layout/PageLayout';
import SignLayout from './components/layout/SignLayout';
import ManagementProviderSetting from './pages/Management/ProviderSetting';
import ManagementReportComment from './pages/Management/Report/Comment';
import ManagementReportPost from './pages/Management/Report/Post';
import MyBookmark from './pages/My/Bookmark';
import MyComment from './pages/My/Comment';
import MyInfo from './pages/My/Info';
import PostDetail from './pages/Post/PostDetail';
import PostList from './pages/Post/PostList';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

export interface NavRoute {
  path: string;
  label: string;
  component?: React.ReactNode;
  children?: NavRoute[];
}

export const navRoutes: NavRoute[] = [
  {
    path: '/',
    label: 'Home',
    component: <PostList />,
    children: [{ path: '/post', label: 'Post', component: <PostDetail /> }],
  },
  {
    path: '/my',
    label: 'My',
    children: [
      { path: '/info', label: 'My Info', component: <MyInfo /> },
      { path: '/bookmark', label: 'My Bookmark', component: <MyBookmark /> },
      { path: '/comment', label: 'My Comment', component: <MyComment /> },
    ],
  },
  {
    path: '/management',
    label: 'Management',
    children: [
      {
        path: '/report',
        label: 'Report',
        children: [
          { path: '/post', label: 'Report Post', component: <ManagementReportPost /> },
          { path: '/comment', label: 'Report Comment', component: <ManagementReportComment /> },
        ],
      },
      {
        path: '/provider-setting',
        label: 'Provider Setting',
        component: <ManagementProviderSetting />,
      },
    ],
  },
];

const createFlatRoutes = (parentPath: string, routes: NavRoute[]): RouteObject[] => {
  return routes
    .flatMap((route) => [
      {
        path: route.path,
        element: route.component,
      },
      ...(route.children ? createFlatRoutes(`${parentPath}${route.path}`, route.children) : []),
    ])
    .filter((route) => route.element !== undefined);
};
const flatRoutes = createFlatRoutes('', navRoutes);

const NotFoundRedirect = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);
  return null;
};

export const router = createBrowserRouter([
  {
    element: <SignLayout />,
    children: [
      { path: '/signin', element: <SignIn /> },
      { path: '/signup', element: <SignUp /> },
    ],
  },
  {
    element: <PageLayout />,
    children: [...flatRoutes],
  },
  { path: '*', element: <NotFoundRedirect /> },
]);
