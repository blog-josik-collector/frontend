import { useMutation, useQueryClient } from '@tanstack/react-query';

import { login, type LoginRequestDto } from '@/services/auth';
import { clearAuthSession, storeAuthSession } from '@/services/auth/session';
import { meQueryKey } from '@/stores/users/meStore';

export const authMutationKeys = {
  login: ['auth', 'login'] as const,
  logout: ['auth', 'logout'] as const,
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: authMutationKeys.login,
    mutationFn: (body: LoginRequestDto) => login(body),
    onSuccess: ({ accessToken, refreshToken }) => {
      storeAuthSession({ accessToken, refreshToken });
      queryClient.invalidateQueries({ queryKey: meQueryKey.detail() });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: authMutationKeys.logout,
    mutationFn: async () => {
      clearAuthSession();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: meQueryKey.detail() });
    },
  });
};
