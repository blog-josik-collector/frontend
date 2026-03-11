import { Link, useLocation, useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavRoute, navRoutes } from '@/routes';

const renderMenuItem = (route: NavRoute, currentPath: string) => {
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

  return <SidebarMenu>{navRoutes.map((route) => renderMenuItem(route, currentPath))}</SidebarMenu>;
};

const AppBar: React.FC = () => {
  const navigate = useNavigate();
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
          <Button
            variant="outline"
            className="w-full hover:cursor-pointer"
            onClick={() => navigate({ to: '/signin' })}
          >
            Sign In
          </Button>
          <Button
            className="w-full hover:cursor-pointer"
            onClick={() => navigate({ to: '/signup' })}
          >
            Sign Up
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppBar;
