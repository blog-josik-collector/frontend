import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

const routes = [
  { path: '/', label: 'Home' },
  { path: '/docs', label: 'Docs' },
  { path: '/about', label: 'About' },
  { path: '/management', label: 'Management' },
];

const MenuList = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {routes.map((route) => (
          <NavigationMenuItem key={route.path}>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link to={route.path}>{route.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
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
