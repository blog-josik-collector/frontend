import { Link, Outlet } from 'react-router';

import { HouseIcon } from 'lucide-react';

import AppBar from '../AppBar';

import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const PageLayout = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppBar />
      <SidebarInset>
        <main className="p-4">
          <div className="mb-2 flex items-center gap-1">
            <SidebarTrigger />
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to="/" aria-label="홈으로 이동">
                <HouseIcon />
              </Link>
            </Button>
          </div>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PageLayout;
