import { useQuery } from '@tanstack/react-query';

import { getCollectPosting } from '@/services/collect';

export const collectPostingsQueryKey = {
  detail: (postingId: string) => ['collect', 'postings', postingId] as const,
};

export const useCollectPosting = (postingId: string) =>
  useQuery({
    queryKey: collectPostingsQueryKey.detail(postingId),
    queryFn: () => getCollectPosting(postingId),
    enabled: Boolean(postingId),
  });
