# Postings Specification

## Purpose

게시물 탐색, 상세 조회, 외부 원문 이동, 좋아요와 북마크 동작을 정의한다.

## Scope

홈 목록, 상세, 내 북마크 화면 및 posting service/store.

## Related Pages

- `src/pages/Post/PostList/*`
- `src/pages/Post/PostDetail/index.tsx`
- `src/pages/My/Bookmark/index.tsx`
- `src/pages/Management/Post/index.tsx`(라우터 미사용)

## Related Stores

- `src/stores/posting/postingStore.ts`

## Related Services

- `src/services/posting/index.ts`

## Requirements

### Requirement: 사용자는 게시물 목록을 탐색할 수 있어야 한다

#### Scenario: 목록 조회

- GIVEN 홈 화면이 열리거나 page, page size, title이 바뀌고
- WHEN 목록 API가 성공하면
- THEN 제목, 게시일, 좋아요 수, 조회 수와 전체 수를 표시해야 한다.

#### Scenario: 페이지 이동

- GIVEN 전체 수로 계산된 페이지가 둘 이상이고
- WHEN 사용자가 페이지 또는 페이지 크기를 변경하면
- THEN 0-based API page로 목록을 다시 조회해야 한다.

#### Scenario: 조회 실패

- GIVEN API가 실패하고
- WHEN store가 오류를 저장하면
- THEN 현재 PostList 구현은 오류나 로딩 상태를 별도로 표시하지 않는다.

### Requirement: 제목 검색은 목록 조회 조건에 반영되어야 한다

#### Scenario: 검색어 변경

- GIVEN 사용자가 검색어를 입력하고
- WHEN 값이 변경되면
- THEN page를 1로 초기화하고 `title` query로 목록을 재조회해야 한다.

#### Scenario: 로컬 필터 변경

- GIVEN 사용자가 필터 옵션을 선택하고
- WHEN 선택 상태가 바뀌면
- THEN 선택 태그와 개수는 바뀌지만 API query는 바뀌지 않아야 한다.

### Requirement: 사용자는 게시물 상세를 조회할 수 있어야 한다

#### Scenario: 상세 성공

- GIVEN `/post`에 `post-id`가 있고
- WHEN 상세 API가 성공하면
- THEN 제목, 날짜, 조회 수, 요약, 원문 링크, 소셜 상태를 표시해야 한다.

#### Scenario: ID 없음

- GIVEN `post-id`가 없고
- WHEN 상세 화면을 열면
- THEN 게시물을 찾을 수 없다는 상태를 표시해야 한다.

#### Scenario: 로딩과 오류

- GIVEN 상세가 cache에 없고 오류도 없으면
- WHEN 요청 중일 때 스켈레톤을 표시하고
- THEN 실패 후에는 오류와 재시도 버튼을 표시해야 한다.

### Requirement: 사용자는 게시물 좋아요를 토글할 수 있어야 한다

#### Scenario: 좋아요 생성

- GIVEN 상세의 `isLiked`가 false이고
- WHEN 좋아요 버튼을 누르면
- THEN 생성 API 후 상세를 재조회해야 한다.

#### Scenario: 좋아요 삭제

- GIVEN `isLiked`가 true이고
- WHEN 좋아요 버튼을 누르면
- THEN 삭제 API 후 상세를 재조회해야 한다.

### Requirement: 사용자는 북마크를 생성·삭제하고 목록을 볼 수 있어야 한다

#### Scenario: 상세에서 북마크 토글

- GIVEN 상세의 북마크 상태가 있고
- WHEN 버튼을 누르면
- THEN 대응 생성 또는 삭제 API 후 상세를 재조회해야 한다.

#### Scenario: 내 북마크 조회

- GIVEN `/my/bookmark`가 열리고
- WHEN 목록을 받으면
- THEN 각 post ID의 상세를 추가 조회하여 제목과 게시일을 보강해야 한다.

#### Scenario: 북마크 삭제

- GIVEN 사용자가 확인 창에서 삭제를 승인하고
- WHEN 삭제가 성공하면
- THEN 목록을 재조회하며 현재 페이지의 마지막 항목이었다면 이전 페이지로 이동해야 한다.

#### Scenario: 빈 목록

- GIVEN 요청이 끝났고 오류가 없으며 항목이 없고
- WHEN 화면을 렌더링하면
- THEN 빈 상태를 표시해야 한다.

## State Behavior

- posting Zustand store는 목록과 상세을 메모리 cache로 유지하며 reset action이 없다.
- 좋아요와 북마크 mutation은 전역 단일 `loading`을 공유한다.
- 북마크 생성은 응답 body 없이 현재 시각을 사용해 로컬 항목을 추가한다.

## API Dependencies

- `GET /api/v1/postings`
- `GET /api/v1/postings/{id}`
- `POST|DELETE /api/v1/postings/{id}/likes`
- `POST|DELETE /api/v1/postings/{id}/bookmarks`
- `GET /api/v1/me/bookmarks`

## Error Handling

상세와 북마크 화면은 오류를 표시한다. 홈 목록은 store 오류를 화면에서 사용하지 않는다.

## Open Questions

- PostList의 필터 옵션을 어떤 `provider_id`에 매핑할지는 코드로 확인되지 않는다.
- MyBookmark API 응답에는 전체 수가 없어 정확한 마지막 페이지를 계산할 수 없다.
