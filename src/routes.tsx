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
  label: string;
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
    label: 'Home',
    component: <PostList />,
    scopes: ['public'],
    children: [
      { path: '/post', label: 'Post', hideMenu: true, component: <PostDetail />, scopes: [] },
    ],
  },
  {
    path: '/my',
    label: 'My',
    scopes: ['admin', 'user'],
    children: [
      { path: '/info', label: 'My Info', component: <MyInfo />, scopes: [] },
      { path: '/bookmark', label: 'My Bookmark', component: <MyBookmark />, scopes: [] },
      { path: '/comment', label: 'My Comment', component: <MyComment />, scopes: [] },
    ],
  },
  {
    path: '/management',
    label: 'Management',
    scopes: ['admin'],
    children: [
      {
        path: '/report',
        label: 'Report',
        scopes: [],
        children: [
          { path: '/post', label: 'Report Post', component: <ManagementReportPost />, scopes: [] },
          {
            path: '/comment',
            label: 'Report Comment',
            component: <ManagementReportComment />,
            scopes: [],
          },
        ],
      },
      {
        path: '/provider-setting',
        label: 'Provider Setting',
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
