import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { sourcesQueryKey } from './sourcesStore';

import {
  type CollectListParams,
  getCollectJob,
  getCollectJobs,
  startCollectJob,
  type StartCollectJobParams,
  stopCollectJob,
} from '@/services/collect';

export const collectJobsQueryKey = {
  list: (params?: CollectListParams) =>
    params ? (['collect', 'jobs', params] as const) : (['collect', 'jobs'] as const),
  detail: (jobId: string) => ['collect', 'jobs', jobId] as const,
};

export const collectJobMutationKeys = {
  start: ['collect', 'jobs', 'start'] as const,
  stop: ['collect', 'jobs', 'stop'] as const,
};

export const useCollectJobs = (params: CollectListParams = { page: 0, size: 20 }) =>
  useQuery({
    queryKey: collectJobsQueryKey.list(params),
    queryFn: () => getCollectJobs(params),
  });

export const useCollectJob = (jobId: string) =>
  useQuery({
    queryKey: collectJobsQueryKey.detail(jobId),
    queryFn: () => getCollectJob(jobId),
    enabled: Boolean(jobId),
  });

export const useStartCollectJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: collectJobMutationKeys.start,
    mutationFn: ({ sourceId, params }: { sourceId: string; params?: StartCollectJobParams }) =>
      startCollectJob(sourceId, params),
    onSuccess: (_, { sourceId }) => {
      queryClient.invalidateQueries({ queryKey: collectJobsQueryKey.list() });
      queryClient.invalidateQueries({ queryKey: sourcesQueryKey.detail(sourceId) });
    },
  });
};

export const useStopCollectJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: collectJobMutationKeys.stop,
    mutationFn: ({ sourceId }: { sourceId: string }) => stopCollectJob(sourceId),
    onSuccess: (_, { sourceId }) => {
      queryClient.invalidateQueries({ queryKey: collectJobsQueryKey.list() });
      queryClient.invalidateQueries({ queryKey: sourcesQueryKey.detail(sourceId) });
    },
  });
};
