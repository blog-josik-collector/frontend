import { Link, useLocation } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface RouteItem {
  path: string;
  label: string;
  desc: string;
  children?: RouteItem[];
}

const routes: RouteItem[] = [
  { path: '/', label: 'Home', desc: '' },
  {
    path: '/my',
    label: 'My',
    desc: '',
    children: [
      { path: '/my/info', label: 'My Info', desc: '' },
      { path: '/my/favorite', label: 'My Favorite', desc: '' },
    ],
  },
  {
    path: '/management',
    label: 'Management',
    desc: '',
    children: [
      { path: '/management/report/post', label: 'Report Post', desc: '' },
      { path: '/management/report/comment', label: 'Report Comment', desc: '' },
      { path: '/management/post-setting', label: 'Post Setting', desc: '' },
    ],
  },
];

const renderMenuItem = (route: RouteItem, currentPath: string) => {
  if (route.children && route.children.length > 0) {
    const hasActiveChild = route.children.some(
      (child) => currentPath === child.path || currentPath.startsWith(child.path + '/'),
    );

    return (
      <SidebarMenuItem key={route.path}>
        <SidebarMenuButton isActive={hasActiveChild ? true : undefined}>
          {route.label}
        </SidebarMenuButton>
        <SidebarMenuSub>
          {route.children.map((child) => (
            <SidebarMenuSubItem key={child.path}>
              <SidebarMenuSubButton
                asChild
                isActive={child.path === currentPath ? true : undefined}
              >
                <Link to={child.path}>{child.label}</Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </SidebarMenuItem>
    );
  }

  const isActive = currentPath === route.path;

  return (
    <SidebarMenuItem key={route.path}>
      <SidebarMenuButton asChild isActive={isActive ? true : undefined}>
        <Link to={route.path}>{route.label}</Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const MenuList = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return <SidebarMenu>{routes.map((route) => renderMenuItem(route, currentPath))}</SidebarMenu>;
};

const AppBar: React.FC = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-3 py-2">
          <h2 className="text-lg font-semibold">Navigation</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <MenuList />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="space-y-2 px-3 py-2">
          <Button variant="outline" className="w-full">
            Sign In
          </Button>
          <Button className="w-full">Sign Up</Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppBar;
