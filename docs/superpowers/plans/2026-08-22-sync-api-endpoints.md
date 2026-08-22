# API Endpoint Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every interaction service request under `src/services` use the endpoint prefix defined by the backend OpenAPI snapshot.

**Architecture:** Treat `backend/docs/api/interaction-service-openapi.json` as the endpoint contract. Add one behavioral contract test that invokes all interaction service operations and observes the method/path sent through the shared API boundary, then minimally replace the stale `/api/v1` prefix with `/interaction/v1` in implementation URLs and their adjacent API comments.

**Tech Stack:** TypeScript 6, Axios, Vitest 4, React/Vite

**Spec:** `C:/Users/hys/Desktop/backend/docs/api/interaction-service-openapi.json`

## Global Constraints

- Preserve the user's existing `.env` modification.
- Do not change DTOs, response mappers, query parameters, HTTP methods, or non-interaction endpoints.
- Use `/interaction/v1` for all 22 interaction operations listed by the OpenAPI snapshot.

---

### Task 1: Lock the interaction endpoint contract with a failing behavioral test

**Files:**
- Create: `src/services/interaction-endpoints.test.ts`

**Interfaces:**
- Consumes: exported interaction service functions and the shared `api` request boundary.
- Produces: a regression test covering all emitted interaction HTTP method/path pairs.

- [x] **Step 1: Write the failing test**

Create a table-driven Vitest test that invokes every exported operation from `posting`, `comment`, and `report`, captures calls at the shared API boundary, and expects the literal OpenAPI values below:

```ts
[
  ['GET', '/interaction/v1/postings'],
  ['POST', '/interaction/v1/postings/post-1/likes'],
  ['DELETE', '/interaction/v1/postings/post-1/likes'],
  ['POST', '/interaction/v1/postings/post-1/bookmarks'],
  ['DELETE', '/interaction/v1/postings/post-1/bookmarks'],
  ['GET', '/interaction/v1/me/bookmarks'],
  ['POST', '/interaction/v1/postings/post-1/comments'],
  ['GET', '/interaction/v1/postings/post-1/comments'],
  ['GET', '/interaction/v1/postings/post-1'],
  ['PATCH', '/interaction/v1/comments/comment-1'],
  ['DELETE', '/interaction/v1/comments/comment-1'],
  ['GET', '/interaction/v1/me/comments'],
  ['POST', '/interaction/v1/comments/comment-1/replies'],
  ['GET', '/interaction/v1/comments/comment-1/replies'],
  ['PATCH', '/interaction/v1/replies/reply-1'],
  ['DELETE', '/interaction/v1/replies/reply-1'],
  ['POST', '/interaction/v1/postings/post-1/reports'],
  ['POST', '/interaction/v1/comments/comment-1/reports'],
  ['GET', '/interaction/v1/admin/reports/postings'],
  ['PATCH', '/interaction/v1/admin/reports/postings/report-1'],
  ['GET', '/interaction/v1/admin/reports/comments'],
  ['PATCH', '/interaction/v1/admin/reports/comments/report-1'],
]
```

- [x] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/services/interaction-endpoints.test.ts`

Expected: FAIL because the service functions emit `/api/v1/...` instead of `/interaction/v1/...`.

### Task 2: Update the interaction service prefix

**Files:**
- Modify: `src/services/posting/index.ts`
- Modify: `src/services/comment/comments.tsx`
- Modify: `src/services/comment/me.tsx`
- Modify: `src/services/comment/replies.tsx`
- Modify: `src/services/report/index.ts`
- Test: `src/services/interaction-endpoints.test.ts`

**Interfaces:**
- Consumes: the failing endpoint contract test from Task 1.
- Produces: interaction requests whose method/path pairs match the OpenAPI snapshot.

- [x] **Step 1: Write the minimal implementation**

Replace every interaction request and adjacent API comment prefix:

```text
/api/v1 -> /interaction/v1
```

Do not alter the suffixes, interpolated identifiers, methods, parameters, bodies, DTOs, or mappers.

- [x] **Step 2: Run the focused test to verify it passes**

Run: `pnpm test src/services/interaction-endpoints.test.ts`

Expected: PASS with all 22 expected method/path pairs.

- [x] **Step 3: Run repository verification and record the existing lint baseline**

Run: `pnpm test && pnpm lint && pnpm build`

Result: tests and build exit 0. Full lint still reports three pre-existing import-sort errors in `src/components/patterns`; all files changed by this endpoint sync pass ESLint.

- [x] **Step 4: Review the diff**

Run: `git diff -- src/services docs/superpowers/plans/2026-08-22-sync-api-endpoints.md`

Expected: only the new contract test, interaction prefix replacements, API comment updates, and this plan are present; `.env` remains untouched.
