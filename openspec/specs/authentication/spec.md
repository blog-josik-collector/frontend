# Authentication Specification

## Purpose

직접 가입 계정의 로그인, 토큰 보관, 로그아웃 및 요청 인증 헤더 동작을 정의한다.

## Scope

`/signin`, `useLogin`, `useLogout`, 공통 Axios interceptor.

## Related Pages

- `src/pages/SignIn/index.tsx`
- `src/pages/SignIn/SignInForm.tsx`

## Related Stores

- `src/stores/auth/authStore.ts`

## Related Services

- `src/services/auth/index.ts`
- `src/services/api.ts`

## Requirements

### Requirement: 사용자는 직접 계정으로 로그인할 수 있어야 한다

#### Scenario: 로그인 성공

- GIVEN ID와 비밀번호가 입력되어 있고
- WHEN 로그인 API가 성공하면
- THEN access token과 refresh token을 localStorage에 저장하고 내 정보 query를 갱신한 뒤 `/`로 이동해야 한다.

#### Scenario: 필수값 누락

- GIVEN ID 또는 비밀번호가 비어 있고
- WHEN 사용자가 제출하면
- THEN API를 호출하지 않고 폼 오류를 표시해야 한다.

#### Scenario: 로그인 실패

- GIVEN 서버가 로그인을 거절하고
- WHEN mutation이 실패하면
- THEN 정규화된 API 오류 메시지를 표시해야 한다.

### Requirement: 인증 토큰이 있는 요청은 Bearer 인증을 사용해야 한다

#### Scenario: access token 존재

- GIVEN localStorage에 access token이 있고
- WHEN API 요청을 전송하면
- THEN `Authorization: Bearer {token}` 헤더를 추가해야 한다.

#### Scenario: access token 부재

- GIVEN access token이 없고
- WHEN API 요청을 전송하면
- THEN Authorization 헤더를 추가하지 않아야 한다.

### Requirement: 사용자는 로컬 세션을 종료할 수 있어야 한다

#### Scenario: 로그아웃

- GIVEN 토큰과 내 정보 cache가 있고
- WHEN `useLogout` mutation이 실행되면
- THEN 두 토큰을 제거하고 내 정보 query를 제거해야 한다.

#### Scenario: 401 응답

- GIVEN API가 401을 반환하고
- WHEN response interceptor가 오류를 처리하면
- THEN access token을 제거하고 `/login`으로 이동해야 한다.

## State Behavior

- 로그인과 로그아웃은 React Query mutation 상태를 제공한다.
- refresh token은 저장 및 삭제만 하며 재발급에 사용되지 않는다.

## API Dependencies

- `POST /auth/v1/auth/login`

## Error Handling

- 로그인 화면은 `handleApiError` 결과를 표시한다.
- 403과 500은 공통 interceptor가 콘솔에만 기록한다.

## Open Questions

- `/login`은 정의된 route가 아니며 실제 로그인 route는 `/signin`이다.
- `ProtectedRoute`가 인증 상태를 검사하지 않아 토큰 유무와 페이지 접근이 연결되지 않는다.
