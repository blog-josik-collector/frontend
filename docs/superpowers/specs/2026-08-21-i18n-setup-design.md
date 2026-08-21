# i18n 초기 설정 및 공통 UI 리소스화

**날짜:** 2026-08-21  
**상태:** Approved for planning  
**스택:** Vite + React 19 + React Router

## 목표

- `i18next` + `react-i18next`로 다국어 기반을 만든다.
- 기본 언어는 한국어(`ko`), 추가 언어는 영어(`en`).
- UI에서 언어를 전환하고 `localStorage`에 저장한다.
- 1차로 공통 UI 문구를 JSON 리소스로 옮긴다. 이후 페이지별로 확장한다.

## 비목표 (이번 범위 밖)

- URL 기반 로케일 (`/ko/...`, `/en/...`)
- 서버/API 응답 메시지 번역
- 콘텐츠(포스트 본문) 번역
- 모든 페이지·테스트 문구의 완전 이전 (2차 이후)

## 결정 사항

| 항목 | 결정 |
|------|------|
| 라이브러리 | `i18next` + `react-i18next` (+ `i18next-browser-languagedetector`) |
| 기본/폴백 언어 | `ko` |
| 지원 언어 | `ko`, `en` |
| 언어 저장 | `localStorage` (키: `i18nextLng`) |
| 전환 UI | `Select` (PC/모바일 공통) |
| 배치 | AppBar `SidebarFooter` (사이드바 시트에서도 동일 노출) |
| 1차 범위 | nav, 공통 버튼/aria, auth 폼 문구·검증, 공통 검색/필터 문구 |

## 아키텍처

```
main.tsx
  └─ import './i18n'          # 앱 렌더 전 초기화
src/i18n/index.ts             # i18n 인스턴스 설정
src/locales/ko/*.json
src/locales/en/*.json
src/components/layout/LanguageSwitcher.tsx
```

### 초기화

- `src/i18n/index.ts`에서 리소스 등록, `fallbackLng: 'ko'`, `defaultNS: 'common'`
- `main.tsx`에서 App 렌더 전에 `import './i18n'`
- Detector 순서: `localStorage` → 없으면 `ko` (브라우저 자동 감지는 1차에서 기본값보다 우선하지 않음; lng가 없을 때만 fallback)

### 컴포넌트 사용

- 클라이언트 컴포넌트: `const { t } = useTranslation(['common', 'nav'])`
- 라우트 라벨: `label` 하드코딩 대신 `labelKey` (예: `nav:home`)를 두고 렌더 시 `t(route.labelKey)`

## 리소스 구조

```
src/locales/
  ko/
    common.json
    nav.json
    auth.json
  en/
    common.json
    nav.json
    auth.json
```

### 네임스페이스 책임

- **common**: 검색, 필터, 지우기, 불러오는 중, 홈으로 이동 등 공유 UI/aria
- **nav**: 사이드바·라우트 메뉴 라벨, Sign In / Sign Up
- **auth**: 로그인/회원가입 플레이스홀더, 버튼, 검증 메시지

### 키 네이밍

- 점 표기, 도메인 우선: `nav.home`, `common.search`, `auth.loginPending`
- 보간이 필요하면 `{{count}}` 사용 (예: `common.filterCount`: `필터 {{count}}`)

## LanguageSwitcher

- UI: shadcn/radix `Select` (기존 UI 컴포넌트 패턴 따름)
- 옵션: `한국어` / `English` (옵션 라벨은 해당 언어 고유명으로 고정; 전환해도 바뀌지 않음)
- 동작: `i18n.changeLanguage(lng)` → detector가 `localStorage`에 저장 → 구독 컴포넌트 리렌더
- 반응형: 사이드바 내부 배치로 데스크톱(펼침)과 모바일(시트)에서 동일 Select 사용. 별도 모바일 전용 컴포넌트는 두지 않음.
- 위치: `SidebarFooter`의 Sign In/Up 버튼 위 또는 아래 (시각적 균형상 Sign 버튼 위 권장)

## 1차 적용 대상

1. i18n 초기화 및 패키지 설치
2. ko/en JSON 리소스 작성 (common, nav, auth)
3. `LanguageSwitcher` Select + AppBar 연결
4. `routes.tsx` 메뉴 라벨 → `labelKey` + AppBar에서 `t()`
5. `PageLayout` aria (`홈으로 이동` 등)
6. `SignIn` / `SignUp` 폼 문구·검증
7. 공통 검색/필터 관련 문구 (`PostingFilter`, `list-toolbar`의 고정 문자열)

관리/상세/마이페이지의 긴 플로우 문구는 2차.

## 데이터 흐름

1. 앱 시작 → i18n 로드 → `localStorage.i18nextLng` 또는 `ko`
2. 사용자가 Select에서 언어 선택 → `changeLanguage`
3. `useTranslation` 사용처가 새 문자열로 리렌더
4. 새로고침 후에도 동일 언어 유지

## 에러·폴백

- 키 누락 시: i18next 기본 동작으로 키 문자열 표시 (개발 중 발견 용이)
- 미지원 언어 코드가 storage에 있으면 `fallbackLng: 'ko'`

## 테스트

- LanguageSwitcher: 선택 시 `document`/`i18n.language`가 바뀌는지
- 네비/로그인 등 1차 적용 화면: 한국어 기본 렌더 확인; 영어 전환 후 라벨 변경 확인
- 기존 테스트는 한국어 문자열을 기대하는 곳이 많음 → 1차에서는 테스트 래퍼에 i18n Provider/`ko` 고정으로 깨짐을 최소화하고, 전환이 핵심인 케이스만 영어 assertion 추가

## 이후 확장

- 네임스페이스 추가: `post`, `my`, `management` 등 페이지 단위
- 필요 시 URL 로케일, 타입 안전한 키 (`i18next` typed resources) 도입
