import React from 'react';

import { RouterProvider } from '@tanstack/react-router';

import { router } from './routes';

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
