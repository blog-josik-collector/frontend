import { Outlet } from '@tanstack/react-router';

import AppBar from '../AppBar';

const PageLayout: React.FC = () => {
  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full max-w-7xl flex-wrap items-center justify-center">
        <AppBar />
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
