import { useQuery } from '@tanstack/react-query';

import {
  getMyComments,
  type GetMyCommentsParams,
} from '@/services/comment/me';

export const myCommentsQueryKey = {
  list: (params?: GetMyCommentsParams) => ['me', 'comments', params] as const,
};

export const useMyComments = (params: GetMyCommentsParams = { page: 0, size: 20 }) =>
  useQuery({
    queryKey: myCommentsQueryKey.list(params),
    queryFn: () => getMyComments(params),
  });
