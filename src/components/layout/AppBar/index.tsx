import { Link, useLocation } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

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

function ListItem({
  title,
  desc,
  href,
  isActive,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & {
  href: string;
  desc: string;
  isActive?: boolean;
}) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className={`hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none ${
            isActive ? 'bg-accent text-accent-foreground' : ''
          }`}
        >
          <div className="flex flex-col gap-1 text-sm">
            <div className="leading-none font-medium">{title}</div>
            {desc && <div className="text-muted-foreground line-clamp-2">{desc}</div>}
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

const renderMenuItem = (route: RouteItem, currentPath: string) => {
  if (route.children && route.children.length > 0) {
    const hasActiveChild = route.children.some(
      (child) => currentPath === child.path || currentPath.startsWith(child.path + '/'),
    );

    return (
      <NavigationMenuItem key={route.path}>
        <NavigationMenuTrigger className={hasActiveChild ? 'bg-accent text-accent-foreground' : ''}>
          {route.label}
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-48">
            {route.children.map((child) => (
              <ListItem
                key={child.path}
                href={child.path}
                title={child.label}
                desc={child.desc}
                isActive={currentPath === child.path}
              />
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  const isActive = currentPath === route.path;

  return (
    <NavigationMenuItem key={route.path}>
      <NavigationMenuLink
        asChild
        className={`${navigationMenuTriggerStyle()} ${
          isActive ? 'bg-accent text-accent-foreground' : ''
        }`}
      >
        <Link to={route.path}>{route.label}</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const MenuList = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {routes.map((route) => renderMenuItem(route, currentPath))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const AppBar: React.FC = () => {
  return (
    <div className="flex w-full items-center justify-between gap-4 p-4">
      <div>dummy</div>
      <MenuList />
      <div>
        <Button>Sign In</Button>
        <Button>Sign up</Button>
      </div>
    </div>
  );
};

export default AppBar;
