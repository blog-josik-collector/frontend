import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axios, { AxiosError } from 'axios';

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

// 에러 타입 정의
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// axios 인스턴스 생성
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 요청 로깅
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error: AxiosError) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  },
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 응답 로깅
    console.log(`API Response: ${response.status} ${response.config.url}`);

    return response;
  },
  (error: AxiosError<ApiError>) => {
    const { response, message } = error;

    // 에러 로깅
    console.error('API Error:', {
      status: response?.status,
      message: response?.data?.message || message,
      url: response?.config?.url,
    });

    // 401 에러 처리 (인증 만료)
    if (response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }

    // 403 에러 처리 (권한 없음)
    if (response?.status === 403) {
      // 권한 없음 페이지로 리다이렉트 또는 알림
      console.warn('Access forbidden');
    }

    // 500 에러 처리 (서버 에러)
    if (response?.status === 500) {
      console.error('Server error occurred');
    }

    return Promise.reject(error);
  },
);

// 일반적인 API 요청 함수들
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.get<T>(url, config),

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.post<T>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.put<T>(url, data, config),

  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.patch<T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.delete<T>(url, config),
};

// 에러 핸들링 유틸리티 함수
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message || 'API 요청 중 오류가 발생했습니다.',
      status: error.response?.status,
      code: error.code,
    };
  }

  return {
    message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
  };
};

export default apiClient;
