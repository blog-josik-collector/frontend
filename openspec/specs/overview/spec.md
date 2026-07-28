# Frontend System Specification

## Purpose

외부 게시물을 탐색하고 좋아요·북마크·댓글·신고로 상호작용하며, 사용자 계정과 관리자용 신고·수집 제공자를 관리하는 React 프론트엔드의 현재 동작을 정의한다.

## Scope

- 직접 계정 회원가입·로그인·로그아웃
- 게시물 목록·상세·소셜 액션
- 댓글·답글과 신고
- 내 정보·비밀번호·회원 탈퇴
- 내 북마크·댓글
- 게시물·댓글 신고 관리
- 수집 제공자 관리
- UI에 연결되지 않은 수집 source/job/result 및 댓글 reply service/store 계약

## Roles

- 방문자: 코드상 로그인·회원가입과 공개 게시물 화면을 사용한다.
- 로그인 사용자: 의도상 `/my/*`와 소셜 액션을 사용하지만 현재 클라이언트 접근 검사는 실효성이 없다.
- 관리자: 의도상 `/management/*`를 사용하지만 역할 검사는 구현되지 않았다.

## Routes

| Route                          | 화면             |
| ------------------------------ | ---------------- |
| `/signin`                      | 로그인           |
| `/signup`                      | 회원가입         |
| `/`                            | 게시물 목록      |
| `/post?post-id={id}`           | 게시물 상세      |
| `/my/info`                     | 내 정보          |
| `/my/bookmark`                 | 내 북마크        |
| `/my/comment`                  | 내 댓글          |
| `/management/report/post`      | 게시물 신고 관리 |
| `/management/report/comment`   | 댓글 신고 관리   |
| `/management/provider-setting` | 수집 제공자 관리 |
| 기타                           | `/`로 리다이렉트 |

## Domains

- `authentication`
- `users`
- `postings`
- `comments`
- `reports`
- `collection`

## Data Flow

```text
Page
  -> React Query hook 또는 Zustand action
    -> Service function
      -> Axios apiClient
        -> API / 개발 환경 MSW
    -> Query cache 또는 Zustand state 갱신
  -> loading / success / error / empty UI
```

## Authentication and Authorization

- 로그인 성공 시 access/refresh token을 localStorage에 저장한다.
- 모든 API 요청은 access token이 있으면 Bearer header를 자동 추가한다.
- 401이면 access token만 제거하고 `/login`으로 이동한다.
- 로그아웃·회원 탈퇴는 두 토큰과 내 정보 캐시를 제거한다.
- `ProtectedRoute`는 현재 인증 여부를 항상 참으로 간주한다.
- 관리자 역할 검사는 없다.

## Common Loading and Error Handling

- React Query 화면은 query/mutation의 `isLoading`, `isFetching`, `isPending`, `isError`를 사용한다.
- 게시물 Zustand store는 `loading`과 문자열 `error`를 직접 관리한다.
- Axios 오류는 `handleApiError`로 정규화할 수 있다.
- 공통 interceptor는 401/403/500을 별도로 기록·처리한다.
- 화면별 오류 표현은 inline message, alert, 재시도 버튼으로 일관되지 않게 분산되어 있다.

## External Dependencies

- React 19, React Router 7
- TanStack React Query, Zustand
- Axios, dayjs
- 개발 모드의 MSW mock backend
- `VITE_API_BASE_URL`로 지정되는 실제 HTTP backend

## Open Questions

상세 불확실성은 `openspec/analysis/open-questions.md`를 따른다.
