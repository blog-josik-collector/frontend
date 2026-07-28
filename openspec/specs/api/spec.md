# API Specification

## Common Contract

- Base URL: `import.meta.env.VITE_API_BASE_URL || '/'`
- Timeout: 10 seconds
- Default header: `Content-Type: application/json`
- Authentication: `localStorage.accessToken`이 존재하면 모든 요청에 `Authorization: Bearer {token}` 추가
- Error: non-2xx/네트워크 오류는 Promise reject. 401은 access token 삭제 후 `/login` 이동, 403/500은 콘솔 기록
- Date mapping: 다수 service가 `dayjs(...).valueOf()`로 epoch milliseconds entity를 생성
- Upload/download endpoint는 없다.

아래 "실패" Scenario의 실패 상태는 React Query error 또는 Zustand의 고정 오류 문자열을 뜻한다. Service 자체는 별도 복구를 수행하지 않는다.

## Authentication

### API: 직접 로그인

- Service function: `login`
- Method / Endpoint: `POST /auth/v1/auth/login`
- Request body: `{ login_id: string, password: string }`
- Response: `{ access_token, refresh_token }` -> `{ accessToken, refreshToken }`
- Authentication: 불필요
- Used by: `useLogin` -> `SignInForm`

#### Scenario: 로그인 성공

- GIVEN ID와 비밀번호가 입력되고
- WHEN 로그인 API가 성공하면
- THEN 두 토큰을 저장하고 `/`로 이동한다.

#### Scenario: 로그인 실패

- GIVEN API가 요청을 거절하고
- WHEN 로그인 mutation이 실패하면
- THEN 폼은 정규화된 오류 메시지를 표시한다.

## Users

### API: 회원가입

- Service function: `signUp`
- Method / Endpoint: `POST /user/v1/users`
- Request body: `{ login_id, password, password_confirm, nickname, introduction }`
- Response: `{ user_id, created_at }` -> `SignUpResponse`
- Authentication: 불필요
- Used by: `useSignUp` -> `SignupForm`
- Scenario: GIVEN 클라이언트 검증을 통과하고 WHEN 요청이 성공하면 THEN `/signin`으로 이동한다.
- Failure: GIVEN 요청이 실패하고 WHEN mutation이 reject되면 THEN 폼 오류를 표시한다.

### API: 내 정보 조회

- Service function: `getMe`
- Method / Endpoint: `GET /user/v1/users/me`
- Request: 없음
- Response: `UserMeDto` -> `UserMe`
- Authentication: access token이 있을 때만 query 활성화
- Used by: `useMe` -> `MyInfo`
- Scenario: GIVEN access token이 있고 WHEN 조회가 성공하면 THEN 계정·프로필 정보를 표시한다.
- Failure: GIVEN 조회가 실패하면 WHEN query가 reject되고 THEN React Query 오류 상태가 되지만 MyInfo에는 전용 오류 UI가 없다.

### API: 내 정보 수정

- Service function: `updateMe`
- Method / Endpoint: `PATCH /user/v1/users/me`
- Request body: `{ nickname: string, introduction?: string }`
- Response: `{ user_id, updated_at }` -> `UpdateMeResponse`
- Used by: `useUpdateMe` -> `MyInfo`
- Scenario: GIVEN nickname이 비어 있지 않고 WHEN 수정이 성공하면 THEN 내 정보 query를 무효화하고 저장 완료를 표시한다.
- Failure: GIVEN 요청이 실패하면 WHEN mutation이 reject되고 THEN 프로필 오류를 표시한다.

### API: 내 비밀번호 변경

- Service function: `updateMyPassword`
- Method / Endpoint: `PATCH /user/v1/users/me/password`
- Request body: `{ password, new_password, new_password_confirm }`
- Response: `UpdateMyPasswordResponse`
- Used by: `useUpdateMyPassword` -> `MyInfo`
- Scenario: GIVEN 새 비밀번호가 8자 이상이고 확인값이 같을 때 WHEN 성공하면 THEN 입력값을 초기화하고 완료를 표시한다.
- Failure: GIVEN API가 실패하면 WHEN mutation이 reject되고 THEN 현재 비밀번호 필드 오류로 표시한다.

### API: OAuth 계정 병합

- Service function: `mergeOAuth`
- Method / Endpoint: `POST /user/v1/users/me/merge-oauth`
- Request body: `{ access_token: string }`
- Response: `void`
- Used by: `useMergeOAuth`; 연결 page 없음
- Scenario: GIVEN hook 호출자가 토큰을 제공하고 WHEN 성공하면 THEN mutation이 성공 상태가 된다.
- Failure: GIVEN API 실패 시 WHEN 요청이 reject되면 THEN mutation이 오류 상태가 된다.

### API: 회원 탈퇴

- Service function: `deleteMe`
- Method / Endpoint: `DELETE /user/v1/users/me`
- Request body: 없음
- Response: `void`
- Used by: `useDeleteMe` -> `MyInfo`
- Scenario: GIVEN 사용자가 확인하고 WHEN 삭제가 성공하면 THEN 토큰과 내 정보 캐시를 제거하고 `/login` 이동을 시도한다.
- Failure: GIVEN 삭제가 실패하면 WHEN mutation이 reject되고 THEN 다이얼로그는 열린 상태지만 전용 오류 문구는 없다.

## Postings

### API: 게시물 목록 조회

- Service function: `getPostings`
- Method / Endpoint: `GET /api/v1/postings`
- Query: `page?`, `size?`, `provider_id?`, `title?`
- Response: `{ total, items: PostingListItemDto[] }` -> `GetPostingsResponse`
- Used by: `usePostingStore` -> `PostList`
- Scenario: GIVEN 목록 조건이 있고 WHEN 조회가 성공하면 THEN store의 `postings`를 교체한다.
- Failure: GIVEN 조회 실패 시 WHEN catch되면 THEN `Failed to fetch postings`를 저장한다.

### API: 좋아요 생성

- Service function: `createPostingLike`
- Method / Endpoint: `POST /api/v1/postings/{postingId}/likes`
- Path: `postingId`; Body/Response: 없음/`void`
- Used by: `usePostingLikeStore` -> `PostDetail`
- Scenario: GIVEN 게시물이 좋아요되지 않았고 WHEN 성공하면 THEN 로컬 liked ID를 추가하고 상세를 재조회한다.
- Failure: GIVEN 실패하면 WHEN catch되고 THEN `Failed to like posting`을 저장한다.

### API: 좋아요 삭제

- Service function: `deletePostingLike`
- Method / Endpoint: `DELETE /api/v1/postings/{postingId}/likes`
- Path: `postingId`; Response: `void`
- Used by: `usePostingLikeStore` -> `PostDetail`
- Scenario: GIVEN 좋아요된 게시물에 WHEN 성공하면 THEN 로컬 liked ID를 제거하고 상세를 재조회한다.
- Failure: GIVEN 실패하면 WHEN catch되고 THEN `Failed to unlike posting`을 저장한다.

### API: 북마크 생성

- Service function: `createPostingBookmark`
- Method / Endpoint: `POST /api/v1/postings/{postingId}/bookmarks`
- Path: `postingId`; Response: `void`
- Used by: `usePostingBookmarkStore` -> `PostDetail`
- Scenario: GIVEN 미북마크 게시물에 WHEN 성공하면 THEN 로컬 북마크 항목을 추가하고 상세를 재조회한다.
- Failure: GIVEN 실패하면 WHEN catch되고 THEN `Failed to bookmark posting`을 저장한다.

### API: 북마크 삭제

- Service function: `deletePostingBookmark`
- Method / Endpoint: `DELETE /api/v1/postings/{postingId}/bookmarks`
- Path: `postingId`; Response: `void`
- Used by: `usePostingBookmarkStore` -> `PostDetail`, `MyBookmark`
- Scenario: GIVEN 북마크된 게시물에 WHEN 성공하면 THEN 로컬 북마크를 제거한다.
- Failure: GIVEN 실패하면 WHEN catch되고 THEN `Failed to remove bookmark`를 저장한다.

### API: 내 북마크 조회

- Service function: `getMyBookmarks`
- Method / Endpoint: `GET /api/v1/me/bookmarks`
- Query: `page?`, `size?`
- Response: `{ items: {post_id,created_at}[] }` -> `GetMyBookmarksResponse`
- Used by: `usePostingBookmarkStore` -> `MyBookmark`
- Scenario: GIVEN 페이지 조건이 있고 WHEN 성공하면 THEN 북마크와 ID 목록을 교체한다.
- Failure: GIVEN 실패하면 WHEN catch되고 THEN `Failed to fetch bookmarks`를 저장한다.

### API: 게시물 댓글 또는 답글 생성

- Service function: `createPostingComment`
- Method / Endpoint: `POST /api/v1/postings/{postingId}/comments`
- Path: `postingId`; Body: `{ content, parent_comment_id? }`
- Response: `{ id, created_at }` -> `CreatePostingCommentResponse`
- Used by: `usePostingCommentStore` -> `PostDetail`
- Scenario: GIVEN 내용이 있고 WHEN 성공하면 THEN 루트 또는 지정 부모 아래 댓글을 만든 후 목록을 재조회한다.
- Failure: GIVEN 실패하면 WHEN store가 catch하고 THEN 오류 문자열을 저장하며 `undefined`를 반환한다.

### API: 게시물 댓글 조회

- Service function: `getPostingComments`
- Method / Endpoint: `GET /api/v1/postings/{postingId}/comments`
- Path: `postingId`; Query: `page?`, `size?`, `parent_comment_id?`
- Response: `{ total_count: string, items }` -> `GetPostingCommentsResponse`
- Used by: `usePostingCommentStore` -> `PostDetail`
- Scenario: GIVEN 게시물과 페이지 조건이 있고 WHEN 성공하면 THEN 루트 댓글 또는 부모별 답글 map을 저장한다.
- Failure: GIVEN 실패하면 WHEN catch되고 THEN 댓글 또는 답글 조회 오류 문자열을 저장한다.

### API: 게시물 상세 조회

- Service function: `getPostingDetail`
- Method / Endpoint: `GET /api/v1/postings/{id}`
- Path: `id`; Response: `PostingDetailDto` -> `PostingDetailEntity`
- Used by: `usePostingDetailStore` -> `PostDetail`, `MyBookmark`
- Scenario: GIVEN ID가 있고 WHEN 성공하면 THEN ID별 상세 cache에 저장한다.
- Failure: GIVEN 실패하면 WHEN catch되고 THEN 상세 오류 및 재시도 UI를 제공한다.

## Comments and Replies

### API: 댓글 수정

- Service function: `updateComment`
- Method / Endpoint: `PATCH /api/v1/comments/{commentId}`
- Path: `commentId`; Body: `{ content }`; Response: `UpdateCommentResponse`
- Used by: `useUpdateComment`; 연결 page 없음
- Scenario: GIVEN 수정 내용이 있고 WHEN 성공하면 THEN postings/comments/my-comments/replies query를 무효화한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN mutation 오류 상태가 된다.

### API: 댓글 삭제

- Service function: `deleteComment`
- Method / Endpoint: `DELETE /api/v1/comments/{commentId}`
- Path: `commentId`; Response: `void`
- Used by: `useDeleteComment` -> `MyComment`
- Scenario: GIVEN 삭제 확인 후 WHEN 성공하면 THEN 내 댓글 cache에서 제거하고 관련 query를 무효화한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN 화면에 정규화된 삭제 오류를 표시한다.

### API: 내 댓글 조회

- Service function: `getMyComments`
- Method / Endpoint: `GET /api/v1/me/comments`
- Query: `page?`, `size?`; Response: `GetMyCommentsResponse`
- Used by: `useMyComments` -> `MyComment`
- Scenario: GIVEN 페이지 조건이 있고 WHEN 성공하면 THEN 댓글과 전체 수를 표시한다.
- Failure: GIVEN 실패하면 WHEN query가 오류 상태가 되고 THEN 오류 메시지를 표시한다.

### API: 답글 생성

- Service function: `createReply`
- Method / Endpoint: `POST /api/v1/comments/{commentId}/replies`
- Path: `commentId`; Body: `{ content }`; Response: `CreateReplyResponse`
- Used by: `useCreateReply`; 연결 page 없음
- Scenario: GIVEN comment ID와 내용이 있고 WHEN 성공하면 THEN 해당 replies와 postings query를 무효화한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN mutation 오류 상태가 된다.

### API: 답글 조회

- Service function: `getCommentReplies`
- Method / Endpoint: `GET /api/v1/comments/{commentId}/replies`
- Path: `commentId`; Query: `page?`, `size?`; Response: `GetCommentRepliesResponse`
- Used by: `useCommentReplies`; 연결 page 없음
- Scenario: GIVEN comment ID가 있고 WHEN 성공하면 THEN 해당 key에 답글 목록을 cache한다.
- Failure: GIVEN ID가 없으면 WHEN hook이 렌더링되어도 THEN query는 실행되지 않는다.

### API: 답글 수정

- Service function: `updateReply`
- Method / Endpoint: `PATCH /api/v1/replies/{replyId}`
- Path: `replyId`; Body: `{ content }`; Response: `UpdateReplyResponse`
- Used by: `useUpdateReply`; 연결 page 없음
- Scenario: GIVEN reply ID와 내용이 있고 WHEN 성공하면 THEN comments와 postings query를 무효화한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN mutation 오류 상태가 된다.

### API: 답글 삭제

- Service function: `deleteReply`
- Method / Endpoint: `DELETE /api/v1/replies/{replyId}`
- Path: `replyId`; Response: `void`
- Used by: `useDeleteReply`; 연결 page 없음
- Scenario: GIVEN reply ID가 있고 WHEN 성공하면 THEN comments와 postings query를 무효화한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN mutation 오류 상태가 된다.

## Reports

### API: 게시물 신고 생성

- Service function: `createPostingReport`
- Method / Endpoint: `POST /api/v1/postings/{postingId}/reports`
- Body: `{ reason_type: POST_ERROR|LINK_ERROR|OTHER, content }`
- Response: `CreateReportResponse`
- Used by: `useCreatePostingReport` -> `PostDetail`
- Scenario: GIVEN 신고 사유가 있고 WHEN 성공하면 THEN 신고·게시물 query를 무효화하고 성공 alert를 표시한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN 실패 alert를 표시한다.

### API: 댓글 신고 생성

- Service function: `createCommentReport`
- Method / Endpoint: `POST /api/v1/comments/{commentId}/reports`
- Body: `{ reason_type: POLITICS|ADULT|OTHER, content }`
- Response: `CreateReportResponse`
- Used by: `useCreateCommentReport` -> `PostDetail`
- Scenario: GIVEN 신고 사유가 있고 WHEN 성공하면 THEN 신고·댓글·게시물 query를 무효화한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN 실패 alert를 표시한다.

### API: 관리자 게시물 신고 조회

- Service function: `getAdminPostingReports`
- Method / Endpoint: `GET /api/v1/admin/reports/postings`
- Query: `page,size,reason_type?,status?,start_date?,end_date?`
- Response: `GetAdminPostingReportsResponse`
- Used by: `useAdminPostingReports` -> report post page
- Scenario: GIVEN 필터 조건이 있고 WHEN 성공하면 THEN 신고 테이블을 표시한다.
- Failure: GIVEN 실패하면 WHEN query가 오류 상태가 되고 THEN 조회 실패 행을 표시한다.

### API: 관리자 게시물 신고 상태 변경

- Service function: `updateAdminPostingReportStatus`
- Method / Endpoint: `PATCH /api/v1/admin/reports/postings/{reportId}`
- Body: `{ status: OPEN|DONE }`; Response: `UpdateReportStatusResponse`
- Used by: 관련 mutation -> report post page
- Scenario: GIVEN 신고 항목이 있고 WHEN 상태 변경이 성공하면 THEN 게시물 신고 목록을 재조회한다.
- Failure: GIVEN 실패하면 WHEN mutation이 오류 상태가 되지만 THEN 전용 오류 문구는 없다.

### API: 관리자 댓글 신고 조회

- Service function: `getAdminCommentReports`
- Method / Endpoint: `GET /api/v1/admin/reports/comments`
- Query: `page,size,reason_type?,status?,start_date?,end_date?`
- Response: `GetAdminCommentReportsResponse`
- Used by: `useAdminCommentReports` -> report comment page
- Scenario: GIVEN 필터 조건이 있고 WHEN 성공하면 THEN 댓글 신고 테이블을 표시한다.
- Failure: GIVEN 실패하면 WHEN query가 오류 상태가 되고 THEN 조회 실패 행을 표시한다.

### API: 관리자 댓글 신고 상태 변경

- Service function: `updateAdminCommentReportStatus`
- Method / Endpoint: `PATCH /api/v1/admin/reports/comments/{reportId}`
- Body: `{ status: OPEN|DONE }`; Response: `UpdateReportStatusResponse`
- Used by: 관련 mutation -> report comment page
- Scenario: GIVEN 신고 항목이 있고 WHEN 변경이 성공하면 THEN 댓글 신고 목록을 재조회한다.
- Failure: GIVEN 실패하면 WHEN mutation이 오류 상태가 되지만 THEN 전용 오류 문구는 없다.

## Collection

### API: Provider 생성

- Service function: `createProvider`
- Method / Endpoint: `POST /collect/v1/providers`
- Body: `{ name, base_url, description, is_used }`; Response: `CreateProviderResponse`
- Used by: `useCreateProvider` -> `ProviderSetting`
- Scenario: GIVEN 이름과 URL이 있고 WHEN 성공하면 THEN provider 목록을 재조회한다.
- Failure: GIVEN 실패하면 WHEN mutation이 오류 상태가 되고 THEN 등록 오류를 표시한다.

### API: Provider 목록 조회

- Service function: `getProviders`
- Method / Endpoint: `GET /collect/v1/providers`
- Query: `page?`, `size?`; Response: `GetProvidersResponse`
- Used by: `useProviders` -> `ProviderSetting`
- Scenario: GIVEN 화면 진입 시 WHEN 성공하면 THEN provider 카드를 표시한다.
- Failure: GIVEN 실패하면 WHEN query가 오류 상태가 되고 THEN 조회 오류를 표시한다.

### API: Provider 상세 조회

- Service function: `getProvider`
- Method / Endpoint: `GET /collect/v1/providers/{providerId}`
- Response: `Provider`; Used by: `useProvider`, 연결 page 없음
- Scenario: GIVEN provider ID가 있고 WHEN 성공하면 THEN 상세 query에 cache한다.
- Failure: GIVEN ID가 없으면 WHEN hook이 렌더링되어도 THEN query는 실행되지 않는다.

### API: Provider 수정

- Service function: `updateProvider`
- Method / Endpoint: `PATCH /collect/v1/providers/{providerId}`
- Body: `{ base_url, description, is_used }`; Response: `UpdateProviderResponse`
- Used by: `useUpdateProvider` -> `ProviderSetting`
- Scenario: GIVEN URL이 있고 WHEN 성공하면 THEN 목록과 상세 query를 무효화한다.
- Failure: GIVEN 실패하면 WHEN mutation이 오류 상태가 되고 THEN 수정 오류를 표시한다.

### API: Provider 삭제

- Service function: `deleteProvider`
- Method / Endpoint: `DELETE /collect/v1/providers/{providerId}`
- Response: `void`; Used by: `useDeleteProvider` -> `ProviderSetting`
- Scenario: GIVEN UI에서 사용 중 source가 없고 WHEN 성공하면 THEN 목록을 재조회하고 상세 cache를 제거한다.
- Failure: GIVEN 실패하면 WHEN mutation이 오류 상태가 되고 THEN 삭제 오류를 표시한다.

### API: Source 생성

- Service function: `createSource`
- Method / Endpoint: `POST /collect/v1/sources`
- Body: manual `{provider_id,url,schedule_type}` 또는 cron body + `cron_expression`
- Response: `CreateSourceResponse`; Used by: `useCreateSource`, 연결 page 없음
- Scenario: GIVEN 유효한 schedule body가 있고 WHEN 성공하면 THEN source와 provider 목록을 재조회한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN mutation 오류 상태가 된다.

### API: Source 목록 조회

- Service function: `getSources`
- Method / Endpoint: `GET /collect/v1/sources`
- Query: `page?`, `size?`; Response: `GetSourcesResponse`
- Used by: `useSources`, 연결 page 없음
- Scenario: GIVEN 페이지 조건이 있고 WHEN 성공하면 THEN 목록 query에 cache한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN query 오류 상태가 된다.

### API: Source 상세 조회

- Service function: `getSource`
- Method / Endpoint: `GET /collect/v1/sources/{sourceId}`
- Response: `Source`; Used by: `useSource`, 연결 page 없음
- Scenario: GIVEN source ID가 있고 WHEN 성공하면 THEN 상세 query에 cache한다.
- Failure: GIVEN ID가 없으면 WHEN hook이 렌더링되어도 THEN query는 실행되지 않는다.

### API: Source 수정

- Service function: `updateSource`
- Method / Endpoint: `PATCH /collect/v1/sources/{sourceId}`
- Body: `{ url, schedule_type, is_used, cron_expression? }`
- Response: `UpdateSourceResponse`; Used by: `useUpdateSource`, 연결 page 없음
- Scenario: GIVEN 수정 body가 있고 WHEN 성공하면 THEN source 목록/상세와 provider 목록을 재조회한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN mutation 오류 상태가 된다.

### API: Source 삭제

- Service function: `deleteSource`
- Method / Endpoint: `DELETE /collect/v1/sources/{sourceId}`
- Response: `void`; Used by: `useDeleteSource`, 연결 page 없음
- Scenario: GIVEN source ID가 있고 WHEN 성공하면 THEN 목록을 재조회하고 상세 cache를 제거한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN mutation 오류 상태가 된다.

### API: 수집 작업 시작

- Service function: `startCollectJob`
- Method / Endpoint: `POST /collect/v1/sources/{sourceId}/_start`
- Response: `{ job_id, job_status }` -> `StartCollectJobResponse`
- Used by: `useStartCollectJob`, 연결 page 없음
- Scenario: GIVEN source ID가 있고 WHEN 성공하면 THEN job 목록과 source 상세를 재조회한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN mutation 오류 상태가 된다.

### API: 수집 작업 중지

- Service function: `stopCollectJob`
- Method / Endpoint: `POST /collect/v1/sources/{sourceId}/_stop`
- Response: `void`; Used by: `useStopCollectJob`, 연결 page 없음
- Scenario: GIVEN source ID가 있고 WHEN 성공하면 THEN job 목록과 source 상세를 재조회한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN mutation 오류 상태가 된다.

### API: 수집 작업 목록 조회

- Service function: `getCollectJobs`
- Method / Endpoint: `GET /collect/v1/jobs`
- Query: `page?`, `size?`; Response: `GetCollectJobsResponse`
- Used by: `useCollectJobs`, 연결 page 없음
- Scenario: GIVEN 페이지 조건이 있고 WHEN 성공하면 THEN job 목록을 cache한다.
- Failure: GIVEN 실패하면 WHEN reject되고 THEN query 오류 상태가 된다.

### API: 수집 작업 상세 조회

- Service function: `getCollectJob`
- Method / Endpoint: `GET /collect/v1/jobs/{jobId}`
- Response: `CollectJob`; Used by: `useCollectJob`, 연결 page 없음
- Scenario: GIVEN job ID가 있고 WHEN 성공하면 THEN 상세 query에 cache한다.
- Failure: GIVEN ID가 없으면 WHEN hook이 렌더링되어도 THEN query는 실행되지 않는다.

### API: 수집 게시물 조회

- Service function: `getCollectPosting`
- Method / Endpoint: `GET /collect/v1/postings/{postingId}`
- Response: `CollectPosting`; Used by: `useCollectPosting`, 연결 page 없음
- Scenario: GIVEN posting ID가 있고 WHEN 성공하면 THEN 수집 결과 상세를 cache한다.
- Failure: GIVEN ID가 없으면 WHEN hook이 렌더링되어도 THEN query는 실행되지 않는다.
