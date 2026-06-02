import { api } from '../api';

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
}

const mapLoginResponseDtoToEntity = (dto: LoginResponseDto): LoginResponse => ({
  accessToken: dto.access_token,
  refreshToken: dto.refresh_token,
});

/**
 * POST /auth/v1/auth/login - 직접 가입한 계정으로 로그인 및 토큰 발급
 */
export const login = async (body: LoginRequestDto): Promise<LoginResponse> => {
  const response = await api.post<LoginResponseDto>('/auth/v1/auth/login', body);
  return mapLoginResponseDtoToEntity(response.data);
};
