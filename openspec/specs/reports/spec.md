# Reports Specification

## Purpose

사용자의 게시물·댓글 신고와 관리자의 신고 조회·처리상태 변경을 정의한다.

## Scope

PostDetail의 신고 UI와 두 관리자 신고 화면.

## Related Pages

- `src/pages/Post/PostDetail/index.tsx`
- `src/pages/Management/Report/Post/index.tsx`
- `src/pages/Management/Report/Comment/index.tsx`

## Related Stores

- `src/stores/reports/postingReportsStore.ts`
- `src/stores/reports/commentReportsStore.ts`

## Related Services

- `src/services/report/index.ts`

## Requirements

### Requirement: 사용자는 게시물을 신고할 수 있어야 한다

#### Scenario: 정형 사유 신고

- GIVEN 게시물 오류 또는 링크 오류를 선택하고
- WHEN 신고 API가 성공하면
- THEN 고정 content와 선택 reason type을 전송하고 성공 alert를 표시해야 한다.

#### Scenario: 기타 신고

- GIVEN OTHER를 선택하고 기타 내용이 입력되어 있고
- WHEN 제출하면
- THEN 입력 content로 신고하고 다이얼로그 상태를 초기화해야 한다.

#### Scenario: 신고 실패

- GIVEN API가 실패하고
- WHEN mutation이 reject되면
- THEN 실패 alert를 표시해야 한다.

### Requirement: 사용자는 댓글을 신고할 수 있어야 한다

#### Scenario: 정치 또는 성인 사유

- GIVEN 댓글의 신고 메뉴에서 정형 사유를 선택하고
- WHEN 요청이 성공하면
- THEN 고정 content로 신고하고 해당 메뉴를 닫아야 한다.

#### Scenario: 기타 댓글 신고

- GIVEN OTHER를 선택하고 내용을 입력했으며
- WHEN 요청이 성공하면
- THEN 해당 comment ID에 신고를 생성하고 다이얼로그를 닫아야 한다.

### Requirement: 관리자는 신고 목록을 조회하고 처리상태를 변경할 수 있어야 한다

#### Scenario: 목록 필터

- GIVEN reason type, status, 시작일 또는 종료일이 바뀌고
- WHEN query가 실행되면
- THEN page를 0으로 초기화하고 선택된 첫 값을 API query에 전달해야 한다.

#### Scenario: 클라이언트 검색

- GIVEN API 응답 목록이 있고
- WHEN 검색어를 입력하면
- THEN ID, 사용자 ID, 유형, content 필드의 부분 일치 항목만 표시해야 한다.

#### Scenario: 상태 변경

- GIVEN 신고 항목이 있고
- WHEN OPEN 또는 DONE을 선택해 API가 성공하면
- THEN 해당 신고 목록 query를 무효화해야 한다.

#### Scenario: 조회 상태

- GIVEN query가 로딩, 오류 또는 성공 빈 결과이고
- WHEN 테이블을 렌더링하면
- THEN 각각 로딩 행, 오류 행 또는 빈 결과 행을 표시해야 한다.

## State Behavior

- report 목록과 mutation은 React Query cache를 사용한다.
- 생성 성공은 report 목록뿐 아니라 postings/comments 관련 key도 무효화한다.
- 관리자 화면의 검색 문자열은 API에 전달되지 않고 받은 페이지에만 적용된다.

## API Dependencies

- `POST /api/v1/postings/{postingId}/reports`
- `POST /api/v1/comments/{commentId}/reports`
- `GET|PATCH /api/v1/admin/reports/postings*`
- `GET|PATCH /api/v1/admin/reports/comments*`

## Error Handling

신고 생성은 alert를 사용한다. 관리자 목록 조회는 테이블 오류 행을 제공하지만 상태 변경 실패를 별도로 표시하지 않는다.

## Open Questions

- 관리자 역할 검사가 없다.
- 복수 유형/상태를 선택할 수 있지만 API에는 배열이 아니라 첫 번째 값만 전달한다.
