import axios from 'axios';

import { QueryClient } from '@tanstack/react-query';

const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (axios.isAxiosError(error) && error.response && error.response.status < 500) {
    return false;
  }

  return failureCount < 2;
};

export const createAppQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryQuery,
        staleTime: 60_000,
      },
    },
  });
