import { Outlet } from '@tanstack/react-router';

const PageLayout: React.FC = () => {
  return (
    <div>
      <h1>Outside Layout</h1>
      <Outlet />
    </div>
  );
};

export default PageLayout;
