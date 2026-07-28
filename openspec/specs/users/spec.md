# Users Specification

## Purpose

회원가입과 현재 사용자 계정·프로필·비밀번호·탈퇴 동작을 정의한다.

## Scope

`/signup`, `/my/info`, user service/store 전체. OAuth 병합 hook은 UI에 연결되지 않았지만 범위에 포함한다.

## Related Pages

- `src/pages/SignUp/*`
- `src/pages/My/Info/index.tsx`

## Related Stores

- `src/stores/users/meStore.ts`

## Related Services

- `src/services/user/index.ts`

## Requirements

### Requirement: 사용자는 직접 계정을 생성할 수 있어야 한다

#### Scenario: 회원가입 성공

- GIVEN nickname, login ID, password, password confirmation이 입력되고
- WHEN API가 성공하면
- THEN `/signin`으로 replace 이동해야 한다.

#### Scenario: 클라이언트 검증 실패

- GIVEN 필수값이 없거나 비밀번호가 8자 미만이거나 확인값이 다르고
- WHEN 폼을 제출하면
- THEN API를 호출하지 않고 검증 오류를 표시해야 한다.

#### Scenario: API 오류

- GIVEN 클라이언트 검증을 통과했지만 API가 실패하고
- WHEN mutation이 reject되면
- THEN 정규화된 오류 메시지를 표시해야 한다.

### Requirement: 토큰이 있는 사용자는 자신의 정보를 조회할 수 있어야 한다

#### Scenario: 내 정보 조회

- GIVEN access token이 있고
- WHEN MyInfo가 내 정보 query를 실행하면
- THEN 계정 ID, 소개, 로그인 유형, nickname을 화면과 폼에 제공해야 한다.

#### Scenario: 토큰 없음

- GIVEN access token이 없고
- WHEN `useMe`가 렌더링되면
- THEN 내 정보 API query를 실행하지 않아야 한다.

### Requirement: 사용자는 자신의 프로필을 수정할 수 있어야 한다

#### Scenario: 프로필 변경 저장

- GIVEN nickname이 비어 있지 않고 기존 값과 다른 입력이 있고
- WHEN 저장 API가 성공하면
- THEN 내 정보 query를 무효화하고 2초 동안 저장 성공 상태를 표시해야 한다.

#### Scenario: nickname 누락

- GIVEN nickname이 비어 있고
- WHEN 저장하면
- THEN API를 호출하지 않고 프로필 오류를 표시해야 한다.

### Requirement: 사용자는 비밀번호를 변경할 수 있어야 한다

#### Scenario: 변경 성공

- GIVEN 현재 비밀번호와 8자 이상의 동일한 새 비밀번호·확인값이 있고
- WHEN API가 성공하면
- THEN 입력값과 오류를 초기화하고 2초 동안 성공 상태를 표시해야 한다.

#### Scenario: 입력 검증 실패

- GIVEN 필수값 누락, 짧은 새 비밀번호 또는 불일치가 있고
- WHEN 제출하면
- THEN 필드별 오류를 표시하고 API를 호출하지 않아야 한다.

#### Scenario: API 실패

- GIVEN 입력 검증은 통과했고
- WHEN API가 실패하면
- THEN 정규화된 오류를 현재 비밀번호 필드에 표시해야 한다.

### Requirement: 사용자는 회원 탈퇴를 요청할 수 있어야 한다

#### Scenario: 탈퇴 성공

- GIVEN 사용자가 경고 다이얼로그에서 탈퇴를 확인하고
- WHEN 삭제 API가 성공하면
- THEN access/refresh token과 내 정보 cache를 제거하고 `/login` 이동을 시도해야 한다.

#### Scenario: 탈퇴 취소

- GIVEN 탈퇴 다이얼로그가 열려 있고
- WHEN 사용자가 취소하면
- THEN 삭제 API를 호출하지 않아야 한다.

### Requirement: OAuth 병합 기능은 service/store 계약을 제공해야 한다

#### Scenario: 병합 hook 호출

- GIVEN 호출자가 OAuth access token을 제공하고
- WHEN `useMergeOAuth`를 실행하면
- THEN `/user/v1/users/me/merge-oauth`로 요청해야 한다.

## State Behavior

- 프로필 수정 성공은 내 정보 query를 invalidate한다.
- 탈퇴 성공은 토큰과 내 정보 query를 제거한다.
- MyInfo의 입력·성공 표시·validation은 컴포넌트 로컬 상태다.

## API Dependencies

- `POST /user/v1/users`
- `GET|PATCH|DELETE /user/v1/users/me`
- `PATCH /user/v1/users/me/password`
- `POST /user/v1/users/me/merge-oauth`

## Error Handling

회원가입·프로필·비밀번호 오류는 화면에 표시하지만 내 정보 조회 오류와 탈퇴 오류는 별도 문구가 없다.

## Open Questions

- OAuth 병합 UI가 없다.
- 탈퇴 안내의 데이터 삭제 범위는 화면 문구 외에 API 계약으로 검증되지 않는다.
