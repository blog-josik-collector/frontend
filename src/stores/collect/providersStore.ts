import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type CollectListParams,
  createProvider,
  type CreateProviderRequestDto,
  deleteProvider,
  getProvider,
  getProviders,
  type Provider,
  updateProvider,
  type UpdateProviderRequestDto,
} from '@/services/collect';

export type { CreateProviderRequestDto, Provider, UpdateProviderRequestDto };

export const providersQueryKey = {
  list: (params?: CollectListParams) =>
    params ? (['collect', 'providers', params] as const) : (['collect', 'providers'] as const),
  detail: (providerId: string) => ['collect', 'providers', providerId] as const,
};

export const providerMutationKeys = {
  create: ['collect', 'providers', 'create'] as const,
  update: ['collect', 'providers', 'update'] as const,
  delete: ['collect', 'providers', 'delete'] as const,
};

export const useProviders = (params: CollectListParams = { page: 0, size: 20 }) =>
  useQuery({
    queryKey: providersQueryKey.list(params),
    queryFn: () => getProviders(params),
  });

export const useProvider = (providerId: string) =>
  useQuery({
    queryKey: providersQueryKey.detail(providerId),
    queryFn: () => getProvider(providerId),
    enabled: Boolean(providerId),
  });

export const useCreateProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: providerMutationKeys.create,
    mutationFn: (body: CreateProviderRequestDto) => createProvider(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providersQueryKey.list() });
    },
  });
};

export const useUpdateProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: providerMutationKeys.update,
    mutationFn: ({ providerId, body }: { providerId: string; body: UpdateProviderRequestDto }) =>
      updateProvider(providerId, body),
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: providersQueryKey.list() });
      queryClient.invalidateQueries({ queryKey: providersQueryKey.detail(providerId) });
    },
  });
};

export const useDeleteProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: providerMutationKeys.delete,
    mutationFn: ({ providerId }: { providerId: string }) => deleteProvider(providerId),
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: providersQueryKey.list() });
      queryClient.removeQueries({ queryKey: providersQueryKey.detail(providerId) });
    },
  });
};
