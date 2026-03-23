import { Outlet } from 'react-router';

import AppBar from '../AppBar';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const PageLayout = () => {
  return (
    <SidebarProvider>
      <AppBar />
      <SidebarInset>
        <main className="p-4">
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PageLayout;
