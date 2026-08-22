import dayjs from 'dayjs';

import { api } from '../api';

export interface SignUpRequestDto {
  login_id: string;
  password: string;
  password_confirm: string;
  nickname: string;
}

export interface SignUpResponseDto {
  user_id: string;
  created_at: string;
}

export interface SignUpResponse {
  userId: string;
  createdAt: number;
}

export interface UserMeDto {
  user_id: string;
  login_id: string;
  user_type: 'USER' | 'ADMIN';
  nickname: string;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

export interface UserMe {
  userId: string;
  loginId: string;
  userType: 'USER' | 'ADMIN';
  nickname: string;
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
}

export interface UpdateMeRequestDto {
  nickname: string;
}

export interface UpdateMeResponseDto {
  user_id: string;
  updated_at: string;
}

export interface UpdateMeResponse {
  userId: string;
  updatedAt: number;
}

export interface UpdateMyPasswordRequestDto {
  password: string;
  new_password: string;
}

export interface UpdateMyPasswordResponseDto {
  user_id: string;
  updated_at: string;
}

export interface UpdateMyPasswordResponse {
  userId: string;
  updatedAt: number;
}

export interface MergeOAuthRequestDto {
  access_token: string;
}

const mapSignUpResponseDtoToEntity = (dto: SignUpResponseDto): SignUpResponse => ({
  userId: dto.user_id,
  createdAt: dayjs(dto.created_at).valueOf(),
});

const mapUserMeDtoToEntity = (dto: UserMeDto): UserMe => ({
  userId: dto.user_id,
  loginId: dto.login_id,
  userType: dto.user_type,
  nickname: dto.nickname,
  createdAt: dayjs(dto.created_at).valueOf(),
  updatedAt: dayjs(dto.updated_at).valueOf(),
  lastLoginAt: dayjs(dto.last_login_at).valueOf(),
});

const mapUpdateMeResponseDtoToEntity = (dto: UpdateMeResponseDto): UpdateMeResponse => ({
  userId: dto.user_id,
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

const mapUpdateMyPasswordResponseDtoToEntity = (
  dto: UpdateMyPasswordResponseDto,
): UpdateMyPasswordResponse => ({
  userId: dto.user_id,
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

/**
 * POST /user/v1/users - 직접 회원가입
 */
export const signUp = async (body: SignUpRequestDto): Promise<SignUpResponse> => {
  const response = await api.post<SignUpResponseDto>('/user/v1/users', body);
  return mapSignUpResponseDtoToEntity(response.data);
};

/**
 * GET /user/v1/users/me - 내 회원정보 조회
 */
export const getMe = async (): Promise<UserMe> => {
  const response = await api.get<UserMeDto>('/user/v1/users/me');
  return mapUserMeDtoToEntity(response.data);
};

/**
 * PATCH /user/v1/users/me - 내 회원정보 수정
 */
export const updateMe = async (body: UpdateMeRequestDto): Promise<UpdateMeResponse> => {
  const response = await api.patch<UpdateMeResponseDto>('/user/v1/users/me', body);
  return mapUpdateMeResponseDtoToEntity(response.data);
};

/**
 * PATCH /user/v1/users/me/password - 내 비밀번호 수정
 */
export const updateMyPassword = async (
  body: UpdateMyPasswordRequestDto,
): Promise<UpdateMyPasswordResponse> => {
  const response = await api.patch<UpdateMyPasswordResponseDto>('/user/v1/users/me/password', body);
  return mapUpdateMyPasswordResponseDtoToEntity(response.data);
};

/**
 * POST /user/v1/users/me/merge-oauth - 회원정보 OAuth 통합
 */
export const mergeOAuth = async (body: MergeOAuthRequestDto): Promise<void> => {
  await api.post<void>('/user/v1/users/me/merge-oauth', body);
};

/**
 * DELETE /user/v1/users/me - 회원탈퇴
 */
export const deleteMe = async (): Promise<void> => {
  await api.delete<void>('/user/v1/users/me');
};
