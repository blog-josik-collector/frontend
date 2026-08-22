# OpenAPI DTO Synchronization Design

## Goal

Synchronize the frontend service DTOs, request parameters, response mappers, stores, and affected screens with the current OpenAPI snapshots in `C:/Users/hys/Desktop/backend/docs/api`, while preserving `refresh_token` as an explicit compatibility exception.

## Source of Truth

- `user-service-openapi.json` defines user and authentication contracts.
- `interaction-service-openapi.json` defines posting, bookmark, comment, reply, and report contracts.
- `integrated-api-openapi.json` defines provider, collection source, collection job, and collected posting contracts.
- `LoginResponseDto.refresh_token` remains supported even though it is absent from the snapshot. No other legacy DTO field receives this exception.
- The OpenAPI snapshots omit useful `required` metadata. Frontend optionality therefore follows response semantics and existing runtime usage, while property names, primitive types, enum values, and object shapes follow the snapshots exactly.

## Design Approach

Service DTOs mirror the OpenAPI wire format. Domain entities remain camel-cased and preserve their existing UI-facing shape when the new response contains equivalent information. Mappers provide this separation; they must not read legacy fields that are absent from the current wire contract.

Compatibility unions that accept both old and new payloads are intentionally excluded because they would hide contract drift. OpenAPI code generation is also excluded because adopting generated clients would restructure the entire service layer beyond this change.

## Posting and Bookmark Contracts

`PostListItemDto` becomes the flat OpenAPI shape: `provider`, `likes_of_me`, `bookmarks_of_me`, the flat count properties, string status, `url`, `created_at`, and `updated_at`. The mapper builds the existing nested `social` entity so the posting list and detail presentation can remain stable.

Posting list wrappers use `total_count`, `page`, `size`, and `items`. The entity wrapper exposes `totalCount`, `page`, `size`, and `items`; stores and pagination consumers use those names.

The posting provider query parameter is `provider`, not `provider_id`. Route search parameters may remain UI-specific, but the service request sent to the backend uses `provider`.

Bookmark responses contain paged `PostDocument` objects rather than bookmark records. The bookmark store consumes those mapped posting entities directly and stops issuing a detail request for every bookmark. The bookmark page displays data available from `PostDocument` and removes the unavailable bookmark-created timestamp.

## Comment and Reply Contracts

Comment list wrappers use numeric `total_count`, plus `page`, `size`, and `items`. Comment DTOs contain `id`, `user_id`, `has_child_comment`, `content`, `status`, `created_at`, and `updated_at`. Legacy `post_id`, `parent_comment_id`, and `total_report_count` fields are removed.

Root comments are loaded from `/postings/{postId}/comments`. Replies are loaded from `/comments/{commentId}/replies`; the posting store must stop sending the removed `parent_comment_id` query parameter to the root-comment endpoint.

Creating a root comment and creating a reply both send only `{ content }`. ISO date-time response fields are converted to numeric timestamps in entities.

Because `/me/comments` no longer returns `post_id`, the My Comments screen removes its post-navigation column and shows comment content, creation date, and delete action only.

## Report Contracts

Report create requests use `report_type`.

- Posting report types: `invalid_content`, `broken_link`, `other`.
- Comment report types: `political`, `adult`, `other`.
- Processing statuses: `pending`, `resolved_deleted`, `rejected_keep`.

Admin filters send `report_type` and the new status values. Admin response DTOs use `reporter_id`, `report_type`, `status`, and `updated_at`; posting reports contain `post_id`, while comment reports contain `comment_id`. Paged wrappers expose total count, page, size, and items. Status update responses include the returned status.

The report creation menus and both management pages use the new enum values and entity fields. Legacy aliases such as `reasonType`, `reportTypeCode`, `processed`, and `userId` are removed instead of maintained as duplicate compatibility fields.

## Collection Contracts

Provider creation sends `name`, `base_url`, and `description`; it does not send `is_used`. The create-provider UI removes the enabled toggle. Provider update retains `is_used`, as defined by the update schema.

Collection source DTOs include `cron_from_page` and `cron_to_page`. Source update requests use `collect_schedule_type`; source create requests continue to use `schedule_type`. These fields remain optional in TypeScript because the snapshot does not express reliable required metadata and manual schedules do not need cron ranges.

Starting a collection job accepts optional `from_page`, `to_page`, and `force_recollect` query parameters. The store mutation forwards these options when supplied and remains callable with only a source identifier.

Collection job DTOs add `collecting_status`, page range, force-recollect flag, and error message, and remove the unsupported `trigger_type`. Collected posting DTOs add summary, indexing status, and last-indexed timestamp. Domain entities expose camel-cased equivalents and convert temporal strings to timestamps.

## User and Authentication Contracts

`LoginResponseDto` retains both `access_token` and `refresh_token` by explicit product decision. Existing session storage behavior remains unchanged.

Signup sends only `login_id`, `password`, `password_confirm`, and `nickname`. The signup form removes introduction.

The current-user response removes `login_type` and `introduction`. The My Info screen removes the introduction and Google-linkage presentation and permits nickname-only profile updates.

Password updates send `password` and `new_password`. The confirmation input remains in the UI for local equality validation but `new_password_confirm` is not sent to the backend.

## Testing

Tests use literal fixtures derived from the OpenAPI snapshots and exercise exported service behavior through the shared API boundary.

- Posting tests cover flat DTO mapping, list pagination, bookmarks, comments, reply routing, and request query names.
- Report tests cover request field names, enum values, paged admin response mapping, and status response mapping.
- Collection tests cover provider/source request bodies, source/job/posting response mapping, and start-job query forwarding.
- User tests cover removed request fields and current-user mapping while retaining refresh-token login behavior.
- Affected UI tests verify that removed server fields are no longer rendered or sent.

Each production behavior change follows a red-green cycle. Final verification runs the focused service/UI tests, the full test suite, changed-file lint, and the production build. Existing unrelated repository-wide lint failures are reported separately rather than modified as part of this change.

## Non-Goals

- Adopting OpenAPI code generation.
- Adding the currently unimplemented index-service endpoints.
- Supporting both legacy and current DTO shapes, except for `refresh_token`.
- Changing backend contracts or OpenAPI generation.
- Refactoring unrelated UI or store architecture.
