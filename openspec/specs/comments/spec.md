# Comments Specification

## Purpose

게시물 댓글·답글 작성과 조회, 내 댓글 조회·삭제 및 독립 comments/replies 계약을 정의한다.

## Scope

PostDetail, MyComment, posting comment Zustand store, comments React Query stores.

## Related Pages

- `src/pages/Post/PostDetail/index.tsx`
- `src/pages/My/Comment/index.tsx`

## Related Stores

- `src/stores/posting/postingStore.ts`
- `src/stores/comments/commentsStore.ts`
- `src/stores/comments/meStore.ts`
- `src/stores/comments/repliesStore.ts`

## Related Services

- `src/services/posting/index.ts`
- `src/services/comment/*.tsx`

## Requirements

### Requirement: 사용자는 게시물 댓글을 조회할 수 있어야 한다

#### Scenario: 루트 댓글 조회

- GIVEN post ID와 댓글 page가 있고
- WHEN `/postings/{id}/comments` 조회가 성공하면
- THEN 루트 댓글과 전체 수를 표시해야 한다.

#### Scenario: 빈 댓글

- GIVEN 조회가 성공했지만 루트 댓글이 없고
- WHEN 화면을 렌더링하면
- THEN 첫 댓글 작성을 안내하는 빈 상태를 표시해야 한다.

### Requirement: 사용자는 댓글과 답글을 작성할 수 있어야 한다

#### Scenario: 루트 댓글 작성

- GIVEN 내용이 비어 있지 않고 reply 대상이 없으며
- WHEN 작성 요청이 끝나면
- THEN 입력을 비우고 첫 댓글 페이지를 재조회해야 한다.

#### Scenario: 답글 작성

- GIVEN reply 대상 comment가 선택되고
- WHEN 제출하면
- THEN `parent_comment_id`를 포함하고 thread root 답글과 현재 댓글 페이지를 다시 조회해야 한다.

#### Scenario: 빈 내용

- GIVEN 입력 내용이 공백이고
- WHEN 제출 버튼을 렌더링하면
- THEN 버튼을 비활성화해야 한다.

### Requirement: 답글 thread는 점진적으로 조회되어야 한다

#### Scenario: 초기 답글 조회

- GIVEN 루트 댓글의 `hasChildComment`가 true이고 아직 답글 cache가 없으며
- WHEN 댓글이 렌더링되면
- THEN 5개 단위의 첫 답글 페이지를 자동 조회해야 한다.

#### Scenario: 답글 더 보기

- GIVEN 불러온 답글 수가 전체 수보다 적고
- WHEN 더 보기 버튼을 누르면
- THEN 다음 page를 append해야 한다.

### Requirement: 사용자는 자신이 작성한 댓글을 조회·삭제할 수 있어야 한다

#### Scenario: 내 댓글 조회

- GIVEN `/my/comment`에서 page가 있고
- WHEN 조회가 성공하면
- THEN 전체 수와 댓글 목록을 표시해야 한다.

#### Scenario: 댓글 삭제 성공

- GIVEN 사용자가 삭제를 확인하고
- WHEN API가 성공하면
- THEN 내 댓글 cache에서 항목과 totalCount를 줄이고 관련 query를 무효화해야 한다.

#### Scenario: 댓글 삭제 실패

- GIVEN 삭제 API가 실패하고
- WHEN mutation이 reject되면
- THEN 정규화된 오류 메시지를 표시해야 한다.

### Requirement: 댓글과 답글 수정·삭제 hook 계약을 제공해야 한다

#### Scenario: 댓글 수정

- GIVEN 호출자가 comment ID와 내용을 제공하고
- WHEN 수정이 성공하면
- THEN postings, comments, my-comments, replies query를 무효화해야 한다.

#### Scenario: 답글 생성·수정·삭제

- GIVEN 호출자가 replies hook을 실행하고
- WHEN mutation이 성공하면
- THEN 관련 comments 또는 postings query를 무효화해야 한다.

## State Behavior

- PostDetail은 별도 replies API가 아니라 posting comments API의 `parent_comment_id`를 사용한다.
- 댓글 페이지 번호는 1-based UI, 0-based API다.
- 내 댓글은 React Query cache를 사용한다.

## API Dependencies

- `GET|POST /api/v1/postings/{postingId}/comments`
- `PATCH|DELETE /api/v1/comments/{commentId}`
- `GET /api/v1/me/comments`
- `GET|POST /api/v1/comments/{commentId}/replies`
- `PATCH|DELETE /api/v1/replies/{replyId}`

## Error Handling

- 내 댓글 조회·삭제는 화면 오류를 제공한다.
- PostDetail 댓글 조회 store 오류는 상세 화면에서 별도 메시지로 표시하지 않는다.
- 댓글 작성 store가 오류를 삼켜 page의 `catch`가 실행되지 않을 수 있다.

## Open Questions

- posting comment endpoint와 replies endpoint가 병존하는 의도는 불명확하다.
- `total_count`의 실제 타입이 string인지 확인이 필요하다.
