import React from 'react';
import { createBrowserRouter, Navigate, type RouteObject, useNavigate } from 'react-router';

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
import { type AuthRole, getStoredRoles } from './services/auth';

type MenuScope = 'public' | 'user' | 'admin';

export interface NavRoute {
  path: string;
  fullPath: string;
  labelKey: string;
  hideMenu?: boolean;
  component?: React.ReactNode;
  scopes: MenuScope[];
  children?: NavRoute[];
}

type BaseNavRoute = Omit<NavRoute, 'fullPath' | 'children'> & {
  children?: BaseNavRoute[];
};

const baseNavRoutes: BaseNavRoute[] = [
  {
    path: '/',
    labelKey: 'home',
    component: <PostList />,
    scopes: ['public'],
    children: [
      { path: '/post', labelKey: 'post', hideMenu: true, component: <PostDetail />, scopes: [] },
    ],
  },
  {
    path: '/my',
    labelKey: 'my',
    scopes: ['admin', 'user'],
    children: [
      { path: '/info', labelKey: 'myInfo', component: <MyInfo />, scopes: [] },
      { path: '/bookmark', labelKey: 'myBookmark', component: <MyBookmark />, scopes: [] },
      { path: '/comment', labelKey: 'myComment', component: <MyComment />, scopes: [] },
    ],
  },
  {
    path: '/management',
    labelKey: 'management',
    scopes: ['admin'],
    children: [
      {
        path: '/report',
        labelKey: 'report',
        scopes: [],
        children: [
          {
            path: '/post',
            labelKey: 'reportPost',
            component: <ManagementReportPost />,
            scopes: [],
          },
          {
            path: '/comment',
            labelKey: 'reportComment',
            component: <ManagementReportComment />,
            scopes: [],
          },
        ],
      },
      {
        path: '/provider-setting',
        labelKey: 'providerSetting',
        component: <ManagementProviderSetting />,
        scopes: [],
      },
    ],
  },
];

const joinPaths = (parentPath: string, path: string) => {
  const normalizedParent = parentPath.replace(/\/+$/, '');
  const normalizedPath = path.replace(/^\/+|\/+$/g, '');

  if (!normalizedParent) {
    return normalizedPath ? `/${normalizedPath}` : '/';
  }

  return normalizedPath ? `${normalizedParent}/${normalizedPath}` : normalizedParent;
};

const joinScopes = (
  parentScopes: MenuScope[] | undefined,
  scopes: MenuScope[] | undefined,
): MenuScope[] => {
  const currentScopeSet = new Set<MenuScope>([]);
  if (parentScopes) {
    parentScopes.forEach((scope) => currentScopeSet.add(scope));
  }
  if (scopes) {
    scopes.forEach((scope) => currentScopeSet.add(scope));
  }
  return Array.from(currentScopeSet);
};

const createNavRoutes = (
  routes: BaseNavRoute[],
  parentPath = '',
  parentScopes: MenuScope[] = [],
): NavRoute[] =>
  routes.map((route) => {
    const fullPath = joinPaths(parentPath, route.path);
    const scopes = joinScopes(parentScopes, route.scopes);

    return {
      ...route,
      fullPath,
      scopes,
      children: route.children ? createNavRoutes(route.children, fullPath, scopes) : undefined,
    };
  });

export const navRoutes = createNavRoutes(baseNavRoutes);

export const canAccessScopes = (scopes: MenuScope[], roles: AuthRole[]): boolean => {
  if (scopes.includes('public')) {
    return true;
  }

  return roles.some((role) => scopes.includes(role.toLowerCase() as MenuScope));
};

export const getAccessibleNavRoutes = (routes: NavRoute[], roles: AuthRole[]): NavRoute[] =>
  routes
    .filter((route) => canAccessScopes(route.scopes, roles))
    .map((route) => ({
      ...route,
      children: route.children ? getAccessibleNavRoutes(route.children, roles) : undefined,
    }));

const RouteAccess = ({ children, scopes }: { children: React.ReactNode; scopes: MenuScope[] }) => {
  if (canAccessScopes(scopes, getStoredRoles())) {
    return children;
  }

  return <Navigate to={localStorage.getItem('accessToken') ? '/' : '/signin'} replace />;
};

const createFlatRoutes = (routes: NavRoute[]): RouteObject[] => {
  return routes
    .flatMap((route) => [
      {
        path: route.fullPath,
        element: route.component ? (
          <RouteAccess scopes={route.scopes}>{route.component}</RouteAccess>
        ) : undefined,
      },
      ...(route.children ? createFlatRoutes(route.children) : []),
    ])
    .filter((route) => route.element !== undefined);
};
const flatRoutes = createFlatRoutes(navRoutes);

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
