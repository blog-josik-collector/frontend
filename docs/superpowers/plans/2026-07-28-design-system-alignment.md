# Design System Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align every user-facing screen with the current tokens, shared UI components, layout patterns, and state treatments documented in `design.md`.

**Architecture:** Keep API, stores, and route behavior unchanged. Add a small `src/components/patterns` layer for page composition, list tools, and reusable state presentation; page files retain their own data fetching and mutations. Normalize pages incrementally so each task ends with a buildable, reviewable screen group.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, Radix UI, shadcn-style components, class-variance-authority, Lucide React, Vitest, Testing Library.

## Global Constraints

- `design.md` and `src/index.css` are the design sources of truth.
- Reuse `src/components/ui` before adding a new component.
- Use semantic tokens; do not introduce direct `white`, `gray`, `green`, `yellow`, or `black` utilities in page code.
- Preserve existing routes, Korean copy, API calls, store behavior, pagination, and mutations.
- Keep mobile-first behavior and verify `md` and `lg` layouts.
- Loading, empty, error, disabled, and destructive states must remain visible and accessible.
- Prefix repository shell commands with `rtk` as required by `AGENTS.md`.
- Do not modify or commit unrelated existing files under `.codex/`, `docs/`, `openspec.md`, or `openspec/`.

## File Structure

### New shared files

- `src/components/patterns/page.tsx`: page-width variants, headers, titles, and descriptions.
- `src/components/patterns/page.test.tsx`: page primitive behavior and variants.
- `src/components/patterns/content-state.tsx`: block and table loading/empty/error states.
- `src/components/patterns/content-state.test.tsx`: content-state semantics.
- `src/components/patterns/list-toolbar.tsx`: shared filter/search/chip presentation.
- `src/components/patterns/list-toolbar.test.tsx`: list-toolbar interactions.
- `src/components/patterns/status-badge.tsx`: semantic status labels using existing tokens.
- `src/components/patterns/status-badge.test.tsx`: status tone mapping.
- `src/components/ui/switch.tsx`: reusable version of the existing provider toggle.
- `src/components/ui/switch.test.tsx`: switch accessible behavior.
- `src/test/setup.ts`: Testing Library matcher setup.
- `src/test/design-consistency.test.ts`: source-level guard against known nonstandard utilities.

### Existing files to modify

- Tooling: `package.json`, `vite.config.ts`
- Layouts: `src/components/layout/PageLayout/index.tsx`, `src/components/layout/SignLayout/index.tsx`
- Authentication: `src/pages/SignIn/index.tsx`, `src/pages/SignIn/SignInForm.tsx`, `src/pages/SignUp/index.tsx`, `src/pages/SignUp/SignUpForm.tsx`
- Posts: `src/pages/Post/PostList/index.tsx`, `src/pages/Post/PostList/PostingFilter.tsx`, `src/pages/Post/PostDetail/index.tsx`
- Management: `src/pages/Management/Post/index.tsx`, `src/pages/Management/ProviderSetting/index.tsx`
- Reports: `src/pages/Management/Report/Post/index.tsx`, `src/pages/Management/Report/Comment/index.tsx`
- My pages: `src/pages/My/Bookmark/index.tsx`, `src/pages/My/Comment/index.tsx`, `src/pages/My/Info/index.tsx`
- Documentation: `design.md`

---

### Task 1: Add tested page-composition primitives

**Files:**

- Create: `src/test/setup.ts`
- Create: `src/components/patterns/page.tsx`
- Create: `src/components/patterns/page.test.tsx`
- Modify: `package.json`
- Modify: `vite.config.ts`

**Interfaces:**

- Produces: `PageContent({ variant, className, ...props })`, where `variant` is `'list' | 'detail' | 'form' | 'grid'`.
- Produces: `PageHeader`, `PageTitle({ level })`, and `PageDescription`.
- Consumers: Tasks 4–8.

- [ ] **Step 1: Install and configure the test harness**

Run:

```bash
rtk pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add `"test": "vitest run"` and `"test:watch": "vitest"` to `package.json`. Add this to `vite.config.ts`:

```ts
/// <reference types="vitest/config" />

test: {
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
},
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 2: Write the failing page primitive tests**

Create tests that render:

```tsx
render(
  <PageContent variant="detail" data-testid="content">
    <PageHeader>
      <div>
        <PageTitle>게시물 상세</PageTitle>
        <PageDescription>게시물 정보를 확인합니다.</PageDescription>
      </div>
    </PageHeader>
  </PageContent>,
);
```

Assert that the detail container has `max-w-4xl`, the title is an `h1` with `text-xl`, and the description has `text-muted-foreground`. Add a second assertion that `level="management"` applies `text-2xl` and `font-bold`.

- [ ] **Step 3: Run the test and verify the missing module failure**

Run:

```bash
rtk pnpm test -- src/components/patterns/page.test.tsx
```

Expected: FAIL because `@/components/patterns/page` does not exist.

- [ ] **Step 4: Implement the page primitives**

Use `cva` and `cn` with these exact variant contracts:

```ts
const pageContentVariants = cva('w-full', {
  variants: {
    variant: {
      list: 'flex flex-col gap-4',
      detail: 'mx-auto max-w-4xl space-y-6 py-2',
      form: 'mx-auto flex max-w-2xl flex-col gap-6 py-4',
      grid: 'flex flex-col gap-6 py-2',
    },
  },
  defaultVariants: { variant: 'list' },
});
```

`PageHeader` uses `flex flex-wrap items-end justify-between gap-4`; `PageTitle` renders an `h1` and maps `default` to `text-xl font-semibold` and `management` to `text-2xl font-bold`; `PageDescription` uses `mt-1 text-sm text-muted-foreground`.

- [ ] **Step 5: Verify and commit**

Run:

```bash
rtk pnpm test -- src/components/patterns/page.test.tsx
rtk pnpm build
rtk git add package.json pnpm-lock.yaml vite.config.ts src/test/setup.ts src/components/patterns/page.tsx src/components/patterns/page.test.tsx
rtk git commit -m "test: add page composition primitives"
```

Expected: tests and build exit 0.

---

### Task 2: Add reusable content states and status badges

**Files:**

- Create: `src/components/patterns/content-state.tsx`
- Create: `src/components/patterns/content-state.test.tsx`
- Create: `src/components/patterns/status-badge.tsx`
- Create: `src/components/patterns/status-badge.test.tsx`

**Interfaces:**

- Produces: `ContentState({ kind, title, description, icon })`, with `kind: 'loading' | 'empty' | 'error' | 'not-found'`.
- Produces: `TableContentState({ colSpan, ...contentStateProps })`.
- Produces: `StatusBadge({ tone, children })`, with `tone: 'default' | 'muted' | 'destructive'`.
- Consumers: Tasks 5–8.

- [ ] **Step 1: Write failing semantic tests**

Test that:

```tsx
render(<ContentState kind="error" title="불러오지 못했습니다." />);
expect(screen.getByRole('alert')).toHaveTextContent('불러오지 못했습니다.');
```

Also test `kind="empty"` uses `role="status"`, `TableContentState` forwards `colSpan={7}`, and `StatusBadge tone="destructive"` has `bg-destructive/10` and `text-destructive`.

- [ ] **Step 2: Run the tests and verify failure**

Run:

```bash
rtk pnpm test -- src/components/patterns/content-state.test.tsx src/components/patterns/status-badge.test.tsx
```

Expected: FAIL because both modules are missing.

- [ ] **Step 3: Implement content states**

`ContentState` uses `flex flex-col items-center gap-3 py-12 text-center`; descriptions use `text-sm text-muted-foreground`; error title and icon use `text-destructive`. `TableContentState` renders the same content inside `TableRow > TableCell`.

Implement badge tones without new color values:

```ts
const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
  {
    variants: {
      tone: {
        default: 'bg-primary/10 text-primary',
        muted: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: { tone: 'muted' },
  },
);
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
rtk pnpm test -- src/components/patterns/content-state.test.tsx src/components/patterns/status-badge.test.tsx
rtk pnpm build
rtk git add src/components/patterns/content-state.tsx src/components/patterns/content-state.test.tsx src/components/patterns/status-badge.tsx src/components/patterns/status-badge.test.tsx
rtk git commit -m "feat: add shared content state patterns"
```

Expected: tests and build exit 0.

---

### Task 3: Extract the repeated list toolbar

**Files:**

- Create: `src/components/patterns/list-toolbar.tsx`
- Create: `src/components/patterns/list-toolbar.test.tsx`

**Interfaces:**

- Produces:

```ts
interface ListToolbarProps {
  filterContent: React.ReactNode;
  filterCount: number;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onClearSearch: () => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}
```

- Consumers: `PostingFilter` and the three management list screens in Tasks 5–6.

- [ ] **Step 1: Write failing interaction tests**

Render `ListToolbar` with `filterCount={2}` and `searchValue="react"`. Assert the filter button exposes “필터 2개 선택됨”, typing calls `onSearchValueChange`, and the clear button calls `onClearSearch`. Render `FilterChip` and assert its remove button has the accessible name `"<label> 필터 제거"`.

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
rtk pnpm test -- src/components/patterns/list-toolbar.test.tsx
```

Expected: FAIL because the module is missing.

- [ ] **Step 3: Implement the toolbar**

Use `DropdownMenu`, `Button`, `Input`, `FilterIcon`, `SearchIcon`, and `XIcon`. Preserve the current structure:

```tsx
<div className="flex flex-col gap-2">
  <div className="bg-background focus-within:ring-ring flex items-center rounded-2xl border focus-within:ring-2">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label={`필터 ${filterCount}개 선택됨`}>
          <FilterIcon />
          필터
          {filterCount > 0 && <span>{filterCount}</span>}
        </Button>
      </DropdownMenuTrigger>
      {filterContent}
    </DropdownMenu>
    <div className="bg-border mx-1 h-5 w-px" />
    <SearchIcon className="text-muted-foreground ml-2 size-4" />
    <Input
      value={searchValue}
      onChange={(event) => onSearchValueChange(event.target.value)}
      placeholder={searchPlaceholder}
      className="flex-1 border-0 shadow-none focus-visible:ring-0"
    />
    {searchValue && (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="검색어 지우기"
        onClick={onClearSearch}
      >
        <XIcon />
      </Button>
    )}
  </div>
  {children && <div className="flex flex-wrap gap-2">{children}</div>}
</div>
```

Use only `Button` for triggers and removal actions. Keep filtering logic outside the component.

- [ ] **Step 4: Verify and commit**

Run:

```bash
rtk pnpm test -- src/components/patterns/list-toolbar.test.tsx
rtk pnpm build
rtk git add src/components/patterns/list-toolbar.tsx src/components/patterns/list-toolbar.test.tsx
rtk git commit -m "feat: extract reusable list toolbar"
```

Expected: tests and build exit 0.

---

### Task 4: Normalize application and authentication shells

**Files:**

- Modify: `src/components/layout/PageLayout/index.tsx`
- Modify: `src/components/layout/SignLayout/index.tsx`
- Modify: `src/pages/SignIn/index.tsx`
- Modify: `src/pages/SignIn/SignInForm.tsx`
- Modify: `src/pages/SignUp/index.tsx`
- Modify: `src/pages/SignUp/SignUpForm.tsx`

**Interfaces:**

- Consumes: `PageContent`, `PageTitle`.
- Produces: one authentication shell shared by sign-in and sign-up; unchanged routes and form submissions.

- [ ] **Step 1: Add a failing layout regression test**

Extend `page.test.tsx` with a `SignLayout` render using a memory router and assert that the outlet container has `min-h-svh`, `bg-muted`, `w-full`, and `max-w-sm`.

- [ ] **Step 2: Verify the current layout fails the assertion**

Run:

```bash
rtk pnpm test -- src/components/patterns/page.test.tsx
```

Expected: FAIL because `SignLayout` currently renders only `<Outlet />`.

- [ ] **Step 3: Move authentication layout into `SignLayout`**

Use this shared shell:

```tsx
<div className="bg-muted flex min-h-svh w-full items-center justify-center p-6 md:p-10">
  <div className="w-full max-w-sm">
    <Outlet />
  </div>
</div>
```

Remove duplicated outer wrappers from `SignIn` and `SignUp`. Keep both forms as `Card > CardHeader > CardContent`, use the same title alignment and `CardTitle` size, and preserve every label, error, link, submit handler, and disabled state.

- [ ] **Step 4: Normalize the authenticated shell**

Keep `PageLayout` as the sole owner of the base `p-4` page inset. Give `SidebarTrigger` an accessible label and place it in a consistent top row with bottom spacing. Do not add padding to `PageContent` primitives.

- [ ] **Step 5: Verify and commit**

Run:

```bash
rtk pnpm test -- src/components/patterns/page.test.tsx
rtk pnpm lint
rtk pnpm build
rtk git add src/components/layout/PageLayout/index.tsx src/components/layout/SignLayout/index.tsx src/pages/SignIn src/pages/SignUp src/components/patterns/page.test.tsx
rtk git commit -m "refactor: align application and auth layouts"
```

Expected: tests, lint, and build exit 0.

---

### Task 5: Align post list and detail screens

**Files:**

- Modify: `src/pages/Post/PostList/index.tsx`
- Modify: `src/pages/Post/PostList/PostingFilter.tsx`
- Modify: `src/pages/Post/PostDetail/index.tsx`
- Modify: `src/pages/Management/Post/index.tsx`

**Interfaces:**

- Consumes: `PageContent`, `PageHeader`, `PageTitle`, `PageDescription`, `ListToolbar`, `FilterChip`, `ContentState`.
- Preserves: posting filters, navigation, bookmark/report/comment actions, paging, and store calls.

- [ ] **Step 1: Replace duplicated list containers**

Wrap both post list screens with `PageContent variant="list"`. Add the shared page header when a title/summary exists. Replace `border-black-2` on `Item` with `variant="outline"` and replace clickable item wrappers with `asChild` links when navigation can be expressed as a link; otherwise preserve keyboard activation explicitly.

- [ ] **Step 2: Migrate both filter implementations**

Keep each screen’s state and dropdown checkbox items local. In `PostingFilter.tsx`, pass its current `DropdownMenuContent` tree as `filterContent` and replace only the outer filter/search/chip markup with:

```tsx
<ListToolbar
  filterContent={
    <DropdownMenuContent className="w-44" align="start">
      <DropdownMenuLabel>필터</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {FILTER_OPTIONS.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={selected.includes(option)}
            onCheckedChange={() => toggleOption(option)}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuGroup>
    </DropdownMenuContent>
  }
  filterCount={selected.length}
  searchValue={search}
  onSearchValueChange={onSearchChange}
  onClearSearch={() => onSearchChange('')}
>
  {selected.map((option) => (
    <FilterChip key={option} label={option} onRemove={() => toggleOption(option)} />
  ))}
</ListToolbar>
```

In `Management/Post/index.tsx`, use the same JSX with its local `setSearch` callback. The report pages are migrated separately in Task 6 using their existing `filterCount` and `filterTags` values.

- [ ] **Step 3: Normalize post detail states**

Use `PageContent variant="detail"` for loaded, loading, and not-found branches. Replace the custom not-found block with `ContentState kind="not-found"` while retaining the current `FileQuestion` icon and Korean copy. Preserve the `Card` structure and all comment/reply/report actions.

- [ ] **Step 4: Verify and commit**

Run:

```bash
rtk pnpm test
rtk pnpm lint
rtk pnpm build
rtk git add src/pages/Post src/pages/Management/Post
rtk git commit -m "refactor: align post screens with design guide"
```

Expected: tests, lint, and build exit 0.

---

### Task 6: Align report tables and management list controls

**Files:**

- Modify: `src/pages/Management/Report/Post/index.tsx`
- Modify: `src/pages/Management/Report/Comment/index.tsx`

**Interfaces:**

- Consumes: `PageContent`, `PageHeader`, `PageTitle`, `PageDescription`, `ListToolbar`, `FilterChip`, `TableContentState`.
- Preserves: report filters, date ranges, status mutations, menus, pagination, and table columns.

- [ ] **Step 1: Replace both page shells and headers**

Use `PageContent variant="list"` and a `PageHeader` with `PageTitle level="management"`. Keep page-specific counts and descriptions in `PageDescription`.

- [ ] **Step 2: Replace duplicated search/filter markup**

Use `ListToolbar` for both report pages. Keep their checkbox groups and date inputs as `filterContent`; render selected values with `FilterChip`. Do not move report query construction into the shared component.

- [ ] **Step 3: Normalize table states and row actions**

Use `TableContentState` for loading, empty, and error rows with the existing exact `colSpan` for each table. Ensure every `MoreHorizontalIcon` trigger is an icon-sized `Button` with an accessible name that includes the report target.

- [ ] **Step 4: Verify and commit**

Run:

```bash
rtk pnpm test
rtk pnpm lint
rtk pnpm build
rtk git add src/pages/Management/Report
rtk git commit -m "refactor: align report management screens"
```

Expected: tests, lint, and build exit 0.

---

### Task 7: Align My pages and table states

**Files:**

- Modify: `src/pages/My/Bookmark/index.tsx`
- Modify: `src/pages/My/Comment/index.tsx`
- Modify: `src/pages/My/Info/index.tsx`

**Interfaces:**

- Consumes: `PageContent`, `PageHeader`, `PageTitle`, `PageDescription`, `TableContentState`, existing `Field` and `Card` components.
- Preserves: bookmark removal, comment deletion, profile/password updates, Google state, account deletion, and paging.

- [ ] **Step 1: Normalize page containers and headers**

Use `PageContent variant="list"` for bookmark/comment pages and `variant="form"` for account information. Replace local header markup with `PageHeader`, `PageTitle`, and `PageDescription`.

- [ ] **Step 2: Normalize table feedback and destructive actions**

Replace free-standing loading, empty, and error blocks with `TableContentState` using each table’s exact column count. Keep destructive actions as `Button variant="destructive"` or a destructive-styled outline action only when the current hierarchy requires lower emphasis.

- [ ] **Step 3: Normalize account fields**

Keep each section inside `Card`. Use `FieldGroup`, `Field`, `FieldLabel`, `FieldDescription`, and `FieldError` consistently; remove duplicated label spacing classes. Preserve the current AlertDialog confirmation flow and keep the destructive warning block on semantic destructive tokens.

- [ ] **Step 4: Verify and commit**

Run:

```bash
rtk pnpm test
rtk pnpm lint
rtk pnpm build
rtk git add src/pages/My
rtk git commit -m "refactor: align account and activity screens"
```

Expected: tests, lint, and build exit 0.

---

### Task 8: Align provider settings and formalize the switch

**Files:**

- Create: `src/components/ui/switch.tsx`
- Create: `src/components/ui/switch.test.tsx`
- Modify: `src/pages/Management/ProviderSetting/index.tsx`

**Interfaces:**

- Produces: `Switch`, forwarding Radix Switch root props.
- Consumes: `PageContent`, `PageHeader`, `PageTitle`, `PageDescription`, `ContentState`, `StatusBadge`.
- Preserves: create, edit, delete, activate/deactivate, modal, and provider store behavior.

- [ ] **Step 1: Write the failing switch test**

Render:

```tsx
render(<Switch aria-label="제공자 활성화" checked={false} onCheckedChange={onChange} />);
await user.click(screen.getByRole('switch', { name: '제공자 활성화' }));
expect(onChange).toHaveBeenCalledWith(true);
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
rtk pnpm test -- src/components/ui/switch.test.tsx
```

Expected: FAIL because `@/components/ui/switch` is missing.

- [ ] **Step 3: Implement the current toggle as a shared component**

Use `Switch.Root` and `Switch.Thumb` from `radix-ui`. Preserve the current `h-6 w-11` root and `h-4 w-4` thumb dimensions, but replace `bg-white` with `bg-background`; use `data-[state=checked]:bg-primary` and `data-[state=unchecked]:bg-input`.

- [ ] **Step 4: Normalize the provider page**

Use `PageContent variant="grid"` and `PageHeader` with management title sizing. Replace hardcoded status colors with:

```ts
const providerTone = {
  active: 'default',
  inactive: 'muted',
} as const;
```

Choose the tone with `providerTone[provider.isUsed ? 'active' : 'inactive']`. Render status through `StatusBadge`, use `ContentState` for loading/empty/error, replace the local toggle with `Switch`, and replace raw labels in create/edit forms with `Field` components.

- [ ] **Step 5: Verify and commit**

Run:

```bash
rtk pnpm test -- src/components/ui/switch.test.tsx
rtk pnpm lint
rtk pnpm build
rtk git add src/components/ui/switch.tsx src/components/ui/switch.test.tsx src/pages/Management/ProviderSetting/index.tsx
rtk git commit -m "refactor: align provider settings screen"
```

Expected: tests, lint, and build exit 0.

---

### Task 9: Add design guardrails and perform the full route audit

**Files:**

- Create: `src/test/design-consistency.test.ts`
- Modify: `design.md`
- Modify only if audit finds a violation: files listed in Tasks 4–8

**Interfaces:**

- Produces: an automated check preventing reintroduction of the known exceptions in `design.md`.

- [ ] **Step 1: Add the source-level consistency test**

Read all `.tsx` files under `src/pages` and fail with the offending path and match when either expression is found:

```ts
const directColor = /\b(?:bg|text|border)-(?:white|black|gray|green|yellow)(?:-\d+)?\b/g;
const invalidUtility = /\bborder-black-2\b/g;
```

Also assert that `PostingFilter.tsx`, both report pages, and `Management/Post/index.tsx` import `ListToolbar`.

- [ ] **Step 2: Run the guardrail and fix only reported violations**

Run:

```bash
rtk pnpm test -- src/test/design-consistency.test.ts
```

Expected: PASS. If it fails, replace each reported direct color with the matching existing semantic token and rerun until exit 0.

- [ ] **Step 3: Run the complete automated verification**

Run:

```bash
rtk pnpm test
rtk pnpm format:check
rtk pnpm lint
rtk pnpm build
```

Expected: all commands exit 0 with zero test failures, formatting differences, lint errors, or build errors.

- [ ] **Step 4: Perform a route-by-route visual and accessibility audit**

Start the app with:

```bash
rtk pnpm dev --host 127.0.0.1
```

At mobile (~390 px) and desktop (~1440 px), inspect:

- `/signin`
- `/signup`
- `/`
- one reachable `/post?post-id=<existing-id>`
- `/management/provider-setting`
- `/management/report/post`
- `/management/report/comment`
- `/my/bookmark`
- `/my/comment`
- `/my/info`

The detail route is `/post` with its existing query-string identifier rather than a path parameter. `src/pages/Management/Post/index.tsx` is not currently registered in `src/routes.tsx`, so verify it by build and source review only; do not add a route. For every reachable route, verify container width, title hierarchy, sidebar behavior, keyboard focus, filter wrapping, table overflow, loading/empty/error presentation, and destructive confirmation. Record unavailable data-dependent states in the commit message rather than fabricating fixtures.

- [ ] **Step 5: Update the guide and commit**

In `design.md`, replace any source path or component name changed during implementation and add the new pattern files to the “기준 소스” list. Do not add aspirational rules that the implementation does not satisfy.

Run:

```bash
rtk git diff --check
rtk git status --short
rtk git add design.md src/test/design-consistency.test.ts
rtk git commit -m "test: enforce design system consistency"
```

Expected: only the intended final audit files are committed; unrelated pre-existing files remain untouched.

## Final Acceptance Criteria

- Every rendered page uses one of the documented page container variants.
- Sign-in and sign-up share the same authentication shell and card hierarchy.
- Repeated filter/search presentation is implemented once in `ListToolbar`.
- Loading, empty, error, and not-found states use shared patterns.
- Page code contains none of the known direct-color or invalid utility exceptions.
- Provider status and toggle controls use semantic, accessible shared components.
- All existing user flows and API/store behavior remain unchanged.
- `rtk pnpm test`, `rtk pnpm format:check`, `rtk pnpm lint`, and `rtk pnpm build` pass.
- All listed routes are checked at mobile and desktop widths when the browser environment is available.
