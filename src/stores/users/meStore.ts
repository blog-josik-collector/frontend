import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clearAuthSession } from '@/services/auth/session';
import {
  deleteMe,
  getMe,
  mergeOAuth,
  type MergeOAuthRequestDto,
  signUp,
  type SignUpRequestDto,
  updateMe,
  type UpdateMeRequestDto,
  updateMyPassword,
  type UpdateMyPasswordRequestDto,
} from '@/services/user';

export const meQueryKey = {
  detail: () => ['users', 'me'] as const,
};

export const userMutationKeys = {
  signUp: ['users', 'sign-up'] as const,
  updateMe: ['users', 'me', 'update'] as const,
  updateMyPassword: ['users', 'me', 'password', 'update'] as const,
  mergeOAuth: ['users', 'me', 'merge-oauth'] as const,
  deleteMe: ['users', 'me', 'delete'] as const,
};

export const useMe = () =>
  useQuery({
    queryKey: meQueryKey.detail(),
    queryFn: getMe,
    enabled: Boolean(localStorage.getItem('accessToken')),
  });

export const useSignUp = () =>
  useMutation({
    mutationKey: userMutationKeys.signUp,
    mutationFn: (body: SignUpRequestDto) => signUp(body),
  });

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: userMutationKeys.updateMe,
    mutationFn: (body: UpdateMeRequestDto) => updateMe(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meQueryKey.detail() });
    },
  });
};

export const useUpdateMyPassword = () =>
  useMutation({
    mutationKey: userMutationKeys.updateMyPassword,
    mutationFn: (body: UpdateMyPasswordRequestDto) => updateMyPassword(body),
  });

export const useMergeOAuth = () =>
  useMutation({
    mutationKey: userMutationKeys.mergeOAuth,
    mutationFn: (body: MergeOAuthRequestDto) => mergeOAuth(body),
  });

export const useDeleteMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: userMutationKeys.deleteMe,
    mutationFn: deleteMe,
    onSuccess: () => {
      clearAuthSession();
      queryClient.removeQueries({ queryKey: meQueryKey.detail() });
    },
  });
};
