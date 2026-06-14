import { Link, useLocation, useNavigate } from 'react-router';

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
    const isActive =
      currentPath === route.fullPath ||
      route.children.some(
        (child) => currentPath === child.fullPath || currentPath.startsWith(child.fullPath + '/'),
      );

    return (
      <SidebarMenuItem key={route.fullPath}>
        <SidebarMenuButton isActive={isActive ? true : undefined}>
          {route.component ? <Link to={route.fullPath}>{route.label}</Link> : route.label}
        </SidebarMenuButton>
        <SidebarMenuSub>
          {route.children.map((child) => {
            if (child.hideMenu) {
              return null;
            }
            if (child.children && child.children.length > 0) {
              return renderMenuItem(child, currentPath);
            }
            return (
              <SidebarMenuSubItem key={child.fullPath}>
                <SidebarMenuSubButton
                  asChild
                  isActive={child.fullPath === currentPath ? true : undefined}
                >
                  <Link to={child.fullPath}>{child.label}</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </SidebarMenuItem>
    );
  }

  const isActive = currentPath === route.fullPath;

  return (
    <SidebarMenuItem key={route.fullPath}>
      <SidebarMenuButton asChild isActive={isActive ? true : undefined}>
        <Link to={route.fullPath}>{route.label}</Link>
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
            onClick={() => navigate('/signin')}
          >
            Sign In
          </Button>
          <Button className="w-full hover:cursor-pointer" onClick={() => navigate('/signup')}>
            Sign Up
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppBar;
