import React from 'react';
import { RouterProvider } from 'react-router';

import { QueryClientProvider } from '@tanstack/react-query';

import { createAppQueryClient } from './queryClient';
import { router } from './routes';

const queryClient = createAppQueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
