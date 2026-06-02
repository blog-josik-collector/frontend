import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { providersQueryKey } from './providersStore';

import {
  type CollectListParams,
  createSource,
  type CreateSourceRequestDto,
  deleteSource,
  getSource,
  getSources,
  updateSource,
  type UpdateSourceRequestDto,
} from '@/services/collect';

export const sourcesQueryKey = {
  list: (params?: CollectListParams) =>
    params ? (['collect', 'sources', params] as const) : (['collect', 'sources'] as const),
  detail: (sourceId: string) => ['collect', 'sources', sourceId] as const,
};

export const sourceMutationKeys = {
  create: ['collect', 'sources', 'create'] as const,
  update: ['collect', 'sources', 'update'] as const,
  delete: ['collect', 'sources', 'delete'] as const,
};

export const useSources = (params: CollectListParams = { page: 0, size: 20 }) =>
  useQuery({
    queryKey: sourcesQueryKey.list(params),
    queryFn: () => getSources(params),
  });

export const useSource = (sourceId: string) =>
  useQuery({
    queryKey: sourcesQueryKey.detail(sourceId),
    queryFn: () => getSource(sourceId),
    enabled: Boolean(sourceId),
  });

export const useCreateSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: sourceMutationKeys.create,
    mutationFn: (body: CreateSourceRequestDto) => createSource(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourcesQueryKey.list() });
      queryClient.invalidateQueries({ queryKey: providersQueryKey.list() });
    },
  });
};

export const useUpdateSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: sourceMutationKeys.update,
    mutationFn: ({ sourceId, body }: { sourceId: string; body: UpdateSourceRequestDto }) =>
      updateSource(sourceId, body),
    onSuccess: (_, { sourceId }) => {
      queryClient.invalidateQueries({ queryKey: sourcesQueryKey.list() });
      queryClient.invalidateQueries({ queryKey: sourcesQueryKey.detail(sourceId) });
      queryClient.invalidateQueries({ queryKey: providersQueryKey.list() });
    },
  });
};

export const useDeleteSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: sourceMutationKeys.delete,
    mutationFn: ({ sourceId }: { sourceId: string }) => deleteSource(sourceId),
    onSuccess: (_, { sourceId }) => {
      queryClient.invalidateQueries({ queryKey: sourcesQueryKey.list() });
      queryClient.removeQueries({ queryKey: sourcesQueryKey.detail(sourceId) });
      queryClient.invalidateQueries({ queryKey: providersQueryKey.list() });
    },
  });
};
