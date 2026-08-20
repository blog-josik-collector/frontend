import { KJUR } from 'jsrsasign';

import { api } from '../api';

export type AuthRole = 'USER' | 'ADMIN';

export interface AccessTokenEntity {
  iss: string;
  iat: number;
  exp: number;
  authenticationId: string;
  userId: string;
  nickname: string;
  roles: AuthRole[];
}

export interface LoginRequestDto {
  login_id: string;
  password: string;
}

export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenEntity: AccessTokenEntity | null;
}

const isAuthRole = (value: unknown): value is AuthRole => value === 'USER' || value === 'ADMIN';

const isAccessTokenEntity = (value: object | undefined): value is AccessTokenEntity => {
  if (!value) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.iss === 'string' &&
    typeof payload.iat === 'number' &&
    typeof payload.exp === 'number' &&
    typeof payload.authenticationId === 'string' &&
    typeof payload.userId === 'string' &&
    typeof payload.nickname === 'string' &&
    Array.isArray(payload.roles) &&
    payload.roles.every(isAuthRole)
  );
};

export const parseAccessToken = (accessToken: string): AccessTokenEntity | null => {
  try {
    const payload = KJUR.jws.JWS.parse(accessToken).payloadObj;
    return isAccessTokenEntity(payload) ? payload : null;
  } catch {
    return null;
  }
};

export const getStoredRoles = (): AuthRole[] => {
  localStorage.removeItem('roles');
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return [];
  }

  return parseAccessToken(accessToken)?.roles ?? [];
};

const mapLoginResponseDtoToEntity = (dto: LoginResponseDto): LoginResponse => ({
  accessToken: dto.access_token,
  refreshToken: dto.refresh_token,
  accessTokenEntity: parseAccessToken(dto.access_token),
});

/**
 * POST /auth/v1/auth/login - 직접 가입한 계정으로 로그인 및 토큰 발급
 */
export const login = async (body: LoginRequestDto): Promise<LoginResponse> => {
  const response = await api.post<LoginResponseDto>('/auth/v1/auth/login', body);
  return mapLoginResponseDtoToEntity(response.data);
};
