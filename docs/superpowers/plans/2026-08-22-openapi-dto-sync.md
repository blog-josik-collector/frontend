# OpenAPI DTO Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make frontend wire DTOs, requests, mappers, stores, and affected screens match the current backend OpenAPI snapshots.

**Architecture:** Wire DTOs mirror OpenAPI exactly, while mapper functions expose camel-cased UI entities and preserve existing entity structure only when the new payload carries equivalent data. Each domain is updated through a focused red-green test cycle so posting/comment, report, collection, and user/auth changes remain independently reviewable.

**Tech Stack:** TypeScript 6, Axios, React 19, Zustand, TanStack Query, Vitest 4, Testing Library

**Spec:** `docs/superpowers/specs/2026-08-22-openapi-dto-sync-design.md`

## Global Constraints

- Treat `C:/Users/hys/Desktop/backend/docs/api/*-openapi.json` as the wire-contract source of truth.
- Preserve `LoginResponseDto.refresh_token` and existing refresh-token storage as the only legacy compatibility exception.
- Do not add compatibility unions for other legacy DTO fields.
- Convert ISO date-time strings to millisecond timestamps at the mapper boundary.
- Do not implement the index-service endpoints.
- Preserve unrelated working-tree changes and the existing untracked endpoint plan.

---

### Task 1: Posting, bookmark, comment, and reply contracts

**Files:**
- Create: `src/services/posting/index.test.ts`
- Create: `src/services/comment/me.test.ts`
- Create: `src/services/comment/replies.test.ts`
- Create: `src/stores/posting/postingStore.test.ts`
- Modify: `src/services/posting/index.ts`
- Modify: `src/services/comment/me.tsx`
- Modify: `src/services/comment/replies.tsx`
- Modify: `src/stores/posting/postingStore.ts`
- Modify: `src/pages/Post/PostList/index.tsx`
- Modify: `src/pages/Post/PostDetail/index.tsx`
- Modify: `src/pages/My/Bookmark/index.tsx`
- Modify: `src/pages/My/Comment/index.tsx`
- Test: `src/pages/Post/PostDetail/index.test.tsx`

**Interfaces:**
- Consumes: interaction OpenAPI `PostListItem`, `PostDocument`, `PostCommentReadDto.Response`, and their offset-page wrappers.
- Produces: `PostingListItem`, `BookmarkedPosting`, and `PostingComment` entities; numeric pagination; reply requests routed through `getCommentReplies`.

- [ ] **Step 1: Write failing posting mapper and request tests**

Use the shared `api` boundary to return literal OpenAPI fixtures and assert the exported behavior:

```ts
const postDto = {
  id: 'post-1',
  provider: 'Provider',
  title: 'Title',
  published_at: '2026-08-22',
  thumbnail_url: 'https://example.com/image.png',
  summary: 'Summary',
  status: 'active',
  likes_of_me: true,
  bookmarks_of_me: false,
  like_count: 3,
  view_count: 7,
  comment_count: 2,
  total_report_count: 0,
  url: 'https://example.com/post',
  created_at: '2026-08-22T00:00:00Z',
  updated_at: '2026-08-22T01:00:00Z',
};

expect(await getPostings({ provider: 'Provider' })).toMatchObject({
  totalCount: 1,
  page: 0,
  size: 10,
  items: [{
    provider: 'Provider',
    status: 'active',
    social: { likeCount: 3, viewCount: 7, isLiked: true, isBookmarked: false },
  }],
});
expect(api.get).toHaveBeenCalledWith('/interaction/v1/postings', {
  params: { provider: 'Provider' },
});
```

Add separate assertions for bookmark `PostDocument` mapping, numeric comment pagination, ISO comment timestamps, and root-comment creation sending only `{ content }`.

- [ ] **Step 2: Write a failing reply-routing store test**

```ts
await usePostingCommentStore
  .getState()
  .fetchPostingCommentReplies('post-1', 'comment-1', { page: 0, size: 5 });

expect(getCommentReplies).toHaveBeenCalledWith('comment-1', { page: 0, size: 5 });
expect(getPostingComments).not.toHaveBeenCalledWith(
  'post-1',
  expect.objectContaining({ parent_comment_id: 'comment-1' }),
);
```

- [ ] **Step 3: Run focused tests and verify RED**

Run: `pnpm test src/services/posting/index.test.ts src/services/comment/me.test.ts src/services/comment/replies.test.ts src/stores/posting/postingStore.test.ts`

Expected: FAIL because current DTOs expect `social`, `provider_id`, `total`, bookmark records, string comment totals, and reply filtering through `parent_comment_id`.

- [ ] **Step 4: Implement the OpenAPI DTOs and mappers**

Use these wire shapes and entity rules:

```ts
type PostingStatus = 'active' | 'blocked' | 'deleted';

interface PostListItemDto {
  id: string;
  provider: string;
  title: string;
  published_at: string;
  thumbnail_url: string;
  summary: string;
  status: PostingStatus;
  likes_of_me: boolean;
  bookmarks_of_me: boolean;
  like_count: number;
  view_count: number;
  comment_count: number;
  total_report_count: number;
  url: string;
  created_at: string;
  updated_at: string;
}

interface OffsetPageDto<T> {
  total_count: number;
  page: number;
  size: number;
  items: T[];
}
```

Map `likes_of_me` and `bookmarks_of_me` into the existing entity `social` object. Replace `provider_id` request params with `provider`. Map bookmarks from `PostDocument` without per-row detail fetching. Remove the unavailable bookmark-created date and My Comments post-navigation UI. Change the posting store reply loader to call `getCommentReplies`.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `pnpm test src/services/posting/index.test.ts src/services/comment/me.test.ts src/services/comment/replies.test.ts src/stores/posting/postingStore.test.ts src/pages/Post/PostDetail/index.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit the posting/comment task**

```bash
git add src/services/posting src/services/comment src/stores/posting src/pages/Post src/pages/My/Bookmark src/pages/My/Comment
git commit -m "fix: sync posting and comment DTOs"
```

### Task 2: Report contracts and management screens

**Files:**
- Create: `src/services/report/index.test.ts`
- Modify: `src/services/report/index.ts`
- Modify: `src/pages/Post/PostDetail/index.tsx`
- Modify: `src/pages/Post/PostDetail/index.test.tsx`
- Modify: `src/pages/Management/Report/Post/index.tsx`
- Modify: `src/pages/Management/Report/Comment/index.tsx`
- Modify: `src/stores/reports/postingReportsStore.ts`
- Modify: `src/stores/reports/commentReportsStore.ts`

**Interfaces:**
- Consumes: interaction OpenAPI post-report and comment-report create, list, and update schemas.
- Produces: request bodies using `report_type`; new lowercase enums; paged report entities using `reporterId`, `reportType`, and `status`.

- [ ] **Step 1: Write failing report request and response tests**

```ts
await createPostingReport('post-1', {
  content: 'broken',
  report_type: PostingReportType.BrokenLink,
});

expect(api.post).toHaveBeenCalledWith('/interaction/v1/postings/post-1/reports', {
  content: 'broken',
  report_type: 'broken_link',
});

expect(await getAdminPostingReports()).toEqual({
  totalCount: 1,
  page: 0,
  size: 20,
  items: [{
    id: 'report-1',
    reporterId: 'user-1',
    postId: 'post-1',
    reportType: 'invalid_content',
    status: 'pending',
    content: 'bad content',
    createdAt: Date.parse('2026-08-22T00:00:00Z'),
    updatedAt: Date.parse('2026-08-22T01:00:00Z'),
  }],
});
```

Cover comment reports and status update responses with the literal values `political`, `adult`, `other`, `pending`, `resolved_deleted`, and `rejected_keep`.

- [ ] **Step 2: Run the report test and verify RED**

Run: `pnpm test src/services/report/index.test.ts src/pages/Post/PostDetail/index.test.tsx`

Expected: FAIL because current requests use `reason_type`, uppercase enums, and legacy response fields.

- [ ] **Step 3: Implement report DTO, mapper, store, and UI changes**

Define:

```ts
const PostingReportType = {
  InvalidContent: 'invalid_content',
  BrokenLink: 'broken_link',
  Other: 'other',
} as const;

const CommentReportType = {
  Political: 'political',
  Adult: 'adult',
  Other: 'other',
} as const;

const ReportStatus = {
  Pending: 'pending',
  ResolvedDeleted: 'resolved_deleted',
  RejectedKeep: 'rejected_keep',
} as const;
```

Use `reporter_id`, `report_type`, `status`, and `updated_at` in wire DTOs. Add `page` and `size` to list wrappers and `status` to update responses. Update report menus, filters, labels, searches, and table cells to consume the new entity names with no legacy fallbacks.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `pnpm test src/services/report/index.test.ts src/pages/Post/PostDetail/index.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the report task**

```bash
git add src/services/report src/stores/reports src/pages/Post/PostDetail src/pages/Management/Report
git commit -m "fix: sync report DTOs"
```

### Task 3: Collection contracts

**Files:**
- Create: `src/services/collect/index.test.ts`
- Modify: `src/services/collect/index.ts`
- Modify: `src/stores/collect/jobsStore.ts`
- Modify: `src/pages/Management/ProviderSetting/index.tsx`

**Interfaces:**
- Consumes: integrated OpenAPI provider, source, collection-job, and collected-posting schemas.
- Produces: exact provider/source request bodies, collection start options, and complete collection entities.

- [ ] **Step 1: Write failing collection request tests**

```ts
await createProvider({ name: 'Provider', base_url: 'https://example.com', description: 'desc' });
expect(api.post).toHaveBeenCalledWith('/collect/v1/providers', {
  name: 'Provider',
  base_url: 'https://example.com',
  description: 'desc',
});

await updateSource('source-1', {
  url: 'https://example.com/feed',
  collect_schedule_type: 'cron',
  cron_expression: '0 0 * * *',
  cron_from_page: 1,
  cron_to_page: 5,
  is_used: true,
});

await startCollectJob('source-1', { from_page: '1', to_page: '5', force_recollect: true });
expect(api.post).toHaveBeenCalledWith('/collect/v1/sources/source-1/_start', undefined, {
  params: { from_page: '1', to_page: '5', force_recollect: true },
});
```

Add literal response fixtures asserting `collectingStatus`, page range, force-recollect, error message, summary, indexing status, and last-indexed timestamp.

- [ ] **Step 2: Run the collection test and verify RED**

Run: `pnpm test src/services/collect/index.test.ts`

Expected: FAIL because the current request and response types omit the new fields and use `schedule_type` for updates.

- [ ] **Step 3: Implement collection DTOs and forwarding**

Add `cron_from_page` and `cron_to_page` to source DTOs. Use `collect_schedule_type` only in update requests. Add:

```ts
interface StartCollectJobParams {
  from_page?: string;
  to_page?: string;
  force_recollect?: boolean;
}
```

Forward these params in Axios config. Remove `trigger_type`; add the current job and posting fields with camel-case entity mappings. Remove `is_used` from provider creation and its create-form toggle, while keeping the provider edit toggle.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `pnpm test src/services/collect/index.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the collection task**

```bash
git add src/services/collect src/stores/collect/jobsStore.ts src/pages/Management/ProviderSetting/index.tsx
git commit -m "fix: sync collection DTOs"
```

### Task 4: User DTOs with refresh-token compatibility

**Files:**
- Modify: `src/services/auth/index.test.ts`
- Create: `src/services/user/index.test.ts`
- Modify: `src/services/user/index.ts`
- Modify: `src/pages/SignUp/SignUpForm.tsx`
- Create: `src/pages/SignUp/SignUpForm.test.tsx`
- Modify: `src/pages/My/Info/index.tsx`
- Create: `src/pages/My/Info/index.test.tsx`

**Interfaces:**
- Consumes: user OpenAPI signup, current-user, profile update, and password update schemas.
- Produces: exact user request bodies and current-user mapping; login continues to return and store `refreshToken`.

- [ ] **Step 1: Write failing user request and mapping tests**

```ts
await signUp({
  login_id: 'user',
  password: 'password',
  password_confirm: 'password',
  nickname: 'nickname',
});

await updateMe({ nickname: 'next nickname' });
await updateMyPassword({ password: 'old password', new_password: 'new password' });

expect(await getMe()).toEqual({
  userId: 'user-1',
  userType: 'USER',
  nickname: 'nickname',
  createdAt: Date.parse('2026-08-22T00:00:00Z'),
  updatedAt: Date.parse('2026-08-22T01:00:00Z'),
  lastLoginAt: Date.parse('2026-08-22T02:00:00Z'),
});
```

Keep the existing login test fixture and assertion for `refresh_token` to protect the approved exception.

- [ ] **Step 2: Write failing My Info and signup UI tests**

Assert that signup does not render or submit introduction, My Info does not render introduction or Google-linkage state, and password confirmation is validated locally but the mutation body contains only `password` and `new_password`.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `pnpm test src/services/auth/index.test.ts src/services/user/index.test.ts src/pages/SignUp/SignUpForm.test.tsx src/pages/My/Info/index.test.tsx`

Expected: FAIL because the legacy user fields are still present and sent.

- [ ] **Step 4: Implement user DTO and UI changes**

Remove `introduction`, `login_type`, and `new_password_confirm` from wire DTOs and service calls. Remove the unsupported signup and My Info controls. Retain the confirm-password component state and equality validation, but construct the mutation body as:

```ts
{ password: passwords.current, new_password: passwords.next }
```

Do not change `LoginResponseDto.refresh_token`, `LoginResponse.refreshToken`, or `storeAuthSession`.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `pnpm test src/services/auth/index.test.ts src/services/user/index.test.ts src/pages/SignUp/SignUpForm.test.tsx src/pages/My/Info/index.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit the user task**

```bash
git add src/services/auth src/services/user src/pages/SignUp src/pages/My/Info
git commit -m "fix: sync user DTOs"
```

### Task 5: Cross-domain verification

**Files:**
- Modify only files already in Tasks 1-4 when verification reveals a defect caused by this DTO synchronization.

**Interfaces:**
- Consumes: all domain changes from Tasks 1-4.
- Produces: a type-safe, tested build with no legacy DTO fields except `refresh_token`.

- [ ] **Step 1: Scan for removed wire fields and legacy enum values**

Run:

```bash
rg -n "provider_id|reason_type|report_type_code|processed|POST_ERROR|LINK_ERROR|POLITICS|OPEN|DONE|login_type|new_password_confirm|parent_comment_id|trigger_type" src
```

Expected: only intentional UI route/search names, local password-confirm state, or unrelated backend concepts remain; no service wire DTO or request uses removed fields.

- [ ] **Step 2: Run all tests**

Run: `pnpm test`

Expected: all tests pass with zero failures.

- [ ] **Step 3: Run changed-file lint**

Run: `pnpm exec eslint src/services src/stores src/pages/Post src/pages/My src/pages/SignUp src/pages/Management/Report src/pages/Management/ProviderSetting`

Expected: exit 0.

- [ ] **Step 4: Run the production build**

Run: `pnpm build`

Expected: TypeScript compilation and Vite build exit 0.

- [ ] **Step 5: Review the final diff**

Run: `git diff --check HEAD~4..HEAD && git status --short`

Expected: no whitespace errors; only planned DTO synchronization files and the pre-existing untracked endpoint plan are present.
