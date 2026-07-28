# Dependency Map

## 인증

```text
SignInForm
  -> useLogin.mutate
    -> login
      -> POST /auth/v1/auth/login
    -> accessToken/refreshToken 저장
    -> ['users','me'] invalidate
  -> 성공 시 /
```

## 게시물 목록과 상세

```text
PostList -> usePostingStore.fetchPostings -> getPostings
  -> GET /api/v1/postings -> postings 저장 -> 목록 렌더링

PostDetail -> usePostingDetailStore.fetchPostingDetail -> getPostingDetail
  -> GET /api/v1/postings/{id} -> ID별 detail 저장 -> 상세 렌더링
```

## 좋아요·북마크

```text
PostDetail -> likePosting/unlikePosting
  -> POST|DELETE /api/v1/postings/{id}/likes
  -> 로컬 likedPostings 변경
  -> 상세 재조회

PostDetail | MyBookmark -> createBookmark/deleteBookmark
  -> POST|DELETE /api/v1/postings/{id}/bookmarks
  -> 로컬 bookmark 상태 변경
  -> 상세 또는 목록 재조회
```

## 댓글과 답글

```text
PostDetail -> usePostingCommentStore
  -> getPostingComments -> GET /api/v1/postings/{id}/comments
  -> postingComments / postingCommentReplies 저장
  -> 댓글·답글 트리 렌더링

PostDetail -> createPostingComment
  -> POST /api/v1/postings/{id}/comments
  -> 루트 댓글 또는 parent_comment_id가 있는 답글 생성
  -> 관련 목록 재조회

MyComment -> useMyComments -> GET /api/v1/me/comments
MyComment -> useDeleteComment -> DELETE /api/v1/comments/{id}
  -> 내 댓글 캐시 제거 및 관련 query invalidate
```

`comments/repliesStore.ts`의 별도 replies API hooks와 `useUpdateComment`는 현재 페이지에서 호출되지 않는다.

## 신고

```text
PostDetail -> useCreatePostingReport/useCreateCommentReport
  -> POST /api/v1/postings/{id}/reports
     또는 /api/v1/comments/{id}/reports
  -> 관련 report/posting/comment query invalidate

Management Report Page -> useAdmin*Reports -> GET admin reports
  -> 테이블 렌더링
  -> useUpdateAdmin*ReportStatus
    -> PATCH admin reports/{reportId}
    -> 목록 invalidate
```

## 사용자 정보

```text
MyInfo -> useMe -> GET /user/v1/users/me -> 폼 렌더링
MyInfo -> useUpdateMe -> PATCH /user/v1/users/me -> me invalidate
MyInfo -> useUpdateMyPassword -> PATCH /user/v1/users/me/password
MyInfo -> useDeleteMe -> DELETE /user/v1/users/me
  -> 토큰 및 me cache 제거 -> /login 이동 시도
```

## 수집

```text
ProviderSetting -> provider hooks -> /collect/v1/providers*
  -> provider list/detail query 갱신 -> 카드/다이얼로그 렌더링

연결 페이지 없음:
source hooks -> /collect/v1/sources*
job hooks -> /collect/v1/jobs* 및 sources/{id}/_start|_stop
collect posting hook -> /collect/v1/postings/{id}
```
