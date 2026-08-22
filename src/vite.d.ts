/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DISABLE_MOCKING: 'true' | 'false';
  // 다른 환경 변수들도 여기에 추가
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
