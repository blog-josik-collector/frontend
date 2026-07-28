# design-test 디자인 가이드

이 문서는 `design-test`에 이미 구현된 디자인을 재사용하기 위한 기준이다. 새로운 시각 언어를 제안하지 않으며, 현재의 전역 토큰과 공용 UI 컴포넌트를 단일 출처로 삼는다.

## 1. 기준과 우선순위

디자인을 구현할 때 다음 순서를 따른다.

1. `src/components/ui`의 공용 컴포넌트를 사용한다.
2. `src/index.css`의 의미 기반 색상과 반경 토큰을 사용한다.
3. 기존 화면 패턴을 재사용한다.
4. 필요한 조합이 없다면 페이지 안에 즉시 복제하지 말고 공용 패턴으로 분리할 수 있는지 먼저 검토한다.

기준 소스:

- 디자인 토큰: `src/index.css`
- UI 스타일: `components.json`의 `radix-maia`
- 아이콘: `lucide-react`
- 클래스 조합: `src/lib/utils.ts`의 `cn`
- 변형 관리: `class-variance-authority`
- 앱 셸: `src/components/layout/PageLayout`, `src/components/layout/AppBar`
- 인증 셸: `src/components/layout/SignLayout`

## 2. 디자인 원칙

### 의미 기반 스타일

색상은 화면에 보이는 색 자체가 아니라 역할로 선택한다. `bg-white`, `text-gray-*`처럼 값을 직접 지정하기보다 `bg-background`, `text-muted-foreground`처럼 의미 기반 토큰을 사용한다. 이 규칙은 현재 정의된 라이트·다크 테마가 동일한 컴포넌트 구조를 공유하게 한다.

### 공용 컴포넌트 우선

버튼, 입력, 카드, 표, 메뉴, 알림 대화상자는 기본 HTML 요소를 직접 꾸미기보다 `src/components/ui`의 컴포넌트를 사용한다. 페이지에서는 배치와 문맥만 결정하고, 상태·크기·포커스 표현은 공용 컴포넌트에 맡긴다.

### 작은 기본 단위

기본 본문과 컨트롤은 `text-sm`, 보조 정보는 `text-xs` 또는 `text-muted-foreground`, 섹션 간격은 `gap-4` 또는 `gap-6`을 중심으로 구성한다. 강조는 색을 늘리기보다 크기, 굵기, 여백의 차이로 만든다.

### 상태가 항상 보이도록 구성

로딩, 빈 결과, 오류, 비활성화, 선택 상태를 정상 상태와 동일한 수준으로 설계한다. 텍스트만 바꾸지 말고 의미 색상, 아이콘, 컨트롤 상태를 함께 사용한다.

## 3. 디자인 토큰

모든 토큰의 실제 값과 다크 모드 대응은 `src/index.css`가 최종 기준이다.

### 색상

| 역할 | Tailwind 토큰 | 사용처 |
| --- | --- | --- |
| 앱 배경 | `background` | 페이지와 기본 입력 배경 |
| 기본 텍스트 | `foreground` | 제목, 본문, 주요 정보 |
| 카드 | `card`, `card-foreground` | 독립된 콘텐츠 영역 |
| 팝오버 | `popover`, `popover-foreground` | 드롭다운과 부유 패널 |
| 주요 행동 | `primary`, `primary-foreground` | 기본 버튼과 활성 강조 |
| 보조 행동 | `secondary`, `secondary-foreground` | 낮은 우선순위 버튼 |
| 비강조 영역 | `muted`, `muted-foreground` | 설명, 메타데이터, 빈 상태 |
| 상호작용 강조 | `accent`, `accent-foreground` | 메뉴 hover와 선택 |
| 위험 상태 | `destructive` | 삭제, 오류, 신고 |
| 경계와 입력 | `border`, `input` | 구분선, 외곽선, 입력 표면 |
| 포커스 | `ring` | 키보드 포커스 |
| 내비게이션 | `sidebar-*` | 사이드바 전용 배경과 상태 |

색상 토큰은 `bg-*`, `text-*`, `border-*`, `ring-*` 형태로 조합한다. 위험하지 않은 상태를 `destructive`로 표현하거나, 단순 장식에 `primary`를 반복 사용하지 않는다.

### 반경

기본 반경은 `--radius: 0.625rem`이며 파생 토큰은 `rounded-sm`부터 `rounded-4xl`까지 정의되어 있다.

- 버튼: 공용 `Button`의 `rounded-4xl`
- 카드와 목록 항목: `rounded-2xl`
- 사이드바 메뉴: `rounded-lg` 또는 `rounded-md`
- 배지와 태그: `rounded-full`

컴포넌트의 기본 반경을 페이지에서 임의로 덮어쓰지 않는다.

### 간격

현재 화면에서 반복되는 간격을 다음 용도로 재사용한다.

| 간격 | 용도 |
| --- | --- |
| `gap-1`, `gap-1.5` | 아이콘과 짧은 텍스트 |
| `gap-2` | 인라인 컨트롤과 액션 |
| `gap-3` | 필드 내부 요소 |
| `gap-4` | 목록, 필터, 일반 섹션 |
| `gap-6` | 카드 그룹과 큰 콘텐츠 구획 |
| `p-4` | 기본 페이지와 작은 컨테이너 |
| `p-6` | 상세 화면과 넓은 카드 문맥 |
| `py-8`, `py-12` | 로딩·빈 결과·오류 상태 |

간격이 필요할 때 위 단위를 먼저 사용하고, 같은 계층에서 서로 다른 값을 섞지 않는다.

## 4. 타이포그래피

프로젝트는 별도 글꼴을 지정하지 않고 Tailwind의 기본 sans-serif 스택을 사용한다.

| 역할 | 현재 패턴 |
| --- | --- |
| 페이지 제목 | `text-xl font-semibold` 또는 관리 화면의 `text-2xl font-bold` |
| 섹션 제목 | `text-lg font-semibold` |
| 카드 제목 | `CardTitle` 기본값인 `text-base font-medium` |
| 본문과 컨트롤 | `text-sm` |
| 보조 설명 | `text-sm text-muted-foreground` |
| 메타데이터와 작은 액션 | `text-xs` |
| 코드·URL | `font-mono text-sm` |

페이지 제목 크기는 화면 유형에 맞춰 기존 패턴을 재사용한다.

- 개인 정보·일반 콘텐츠 화면: `text-xl font-semibold`
- 관리 대시보드의 최상위 화면: `text-2xl font-bold`
- 목록 내부 제목: `text-lg font-semibold`

같은 화면 안에서 제목 단계를 건너뛰지 않으며, 보조 텍스트는 크기보다 `text-muted-foreground`로 계층을 구분한다.

## 5. 레이아웃

### 앱 셸

로그인 이후 화면은 `PageLayout`의 `SidebarProvider → AppBar → SidebarInset` 구조를 사용한다. 기본 콘텐츠 여백은 `main`의 `p-4`이며, 모바일에서는 `SidebarTrigger`로 내비게이션을 연다.

새 보호 화면은 별도 셸을 만들지 않고 이 라우트 구조 아래에 둔다.

### 페이지 유형

| 유형 | 재사용할 현재 패턴 | 예시 |
| --- | --- | --- |
| 목록·테이블 | `flex flex-col gap-4 p-4` | 게시물 목록, 신고 목록, 내 댓글 |
| 상세 콘텐츠 | `mx-auto max-w-4xl space-y-6 p-6` | 게시물 상세 |
| 설정·폼 | `mx-auto max-w-2xl flex flex-col gap-6 px-4 py-8` | 회원 정보 |
| 카드 그리드 | `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3` | 제공자 설정 |
| 인증 | `min-h-svh`, 중앙 정렬, `w-full max-w-sm` | 로그인, 회원가입 |

페이지가 위 유형 중 하나에 해당하면 컨테이너 폭과 여백을 그대로 재사용한다. 같은 유형의 화면마다 새로운 `max-w-*` 값을 만들지 않는다.

### 반응형

- 모바일을 기본으로 작성하고 `md`, `lg`에서 확장한다.
- 카드 그리드는 1열에서 시작해 `md:2열`, `lg:3열`로 확장한다.
- 사이드바는 모바일에서 Sheet, 데스크톱에서 고정 영역으로 동작한다.
- 액션 행은 좁은 화면에서 줄바꿈될 수 있도록 `flex-wrap`과 `gap-*`을 사용한다.
- 데이터가 많은 표는 열을 무리하게 축소하기보다 의미 있는 최소 폭과 별도 모바일 표현을 검토한다.

## 6. 공용 컴포넌트

### Button

`src/components/ui/button.tsx`의 `Button`을 사용한다.

| variant | 용도 |
| --- | --- |
| `default` | 화면의 주요 행동 |
| `secondary` | 보조 행동 또는 페이지 이동 |
| `outline` | 취소, 이전·다음, 낮은 강조 |
| `ghost` | 행 내부 액션과 아이콘 액션 |
| `destructive` | 삭제와 되돌리기 어려운 행동 |
| `link` | 콘텐츠 안의 탐색 행동 |

크기는 `xs`, `sm`, `default`, `lg`와 아이콘 전용 크기를 사용한다. 아이콘만 있는 버튼에는 접근 가능한 이름을 제공한다. 클릭 가능한 `<div>`나 별도 스타일의 `<button>`을 만들지 않는다.

### Card

독립된 정보 묶음은 `Card`를 사용하고 다음 슬롯을 유지한다.

- `CardHeader`: 제목, 설명, 우측 액션
- `CardContent`: 핵심 정보와 입력
- `CardFooter`: 주요 액션
- `CardTitle`, `CardDescription`, `CardAction`: 내부 계층

카드 자체는 기본 `rounded-2xl`, `ring-1`, `gap-6`, `py-6`을 유지한다. 카드 크기를 줄여야 할 때는 `size="sm"`을 사용한다.

### Field와 입력

폼은 `FieldGroup → Field → FieldLabel/Input → FieldDescription/FieldError` 구조를 사용한다.

- 입력에는 항상 연결된 label을 둔다.
- 도움말은 `FieldDescription`, 오류는 `FieldError`를 사용한다.
- 서버 오류도 가능한 한 해당 필드 또는 폼 그룹 가까이에 표시한다.
- 읽기 전용 정보 행은 `Field orientation="horizontal"`과 `FieldTitle` 패턴을 사용한다.
- 여러 필드는 `gap-6` 또는 `FieldGroup` 기본 간격을 유지한다.

### Item

간단한 반복 목록은 `ItemGroup`과 `Item`을 사용한다.

- 아이콘·이미지: `ItemMedia`
- 제목과 설명: `ItemContent`, `ItemTitle`, `ItemDescription`
- 우측 메타데이터와 액션: `ItemActions`
- 긴 제목은 기본 line clamp를 유지한다.

행 전체가 이동을 수행하면 링크 의미를 보존할 수 있도록 `asChild`와 실제 링크 사용을 우선한다.

### Table

비교와 관리가 중심인 구조화 데이터는 `Table` 계열을 사용한다.

- `TableHeader`에는 짧고 명확한 열 이름을 사용한다.
- 날짜, 상태, 액션 열은 반복되는 폭을 맞춘다.
- 행 액션은 `Button`의 `ghost`, `outline`, `icon` 크기를 사용한다.
- 로딩·빈 결과·오류는 표 바깥의 임시 텍스트가 아니라 전체 열을 합친 `TableCell` 또는 공통 상태 영역에 표시한다.

### Sidebar와 메뉴

앱 내비게이션은 `Sidebar` 계열 컴포넌트와 `src/routes.tsx`의 `navRoutes`를 단일 출처로 사용한다.

- 활성 상태는 `isActive`로 표현한다.
- 하위 경로는 `SidebarMenuSub` 구조를 사용한다.
- 사이드바 전용 색상은 반드시 `sidebar-*` 토큰을 사용한다.
- 메뉴 레이블과 라우트 레이블을 페이지마다 다시 작성하지 않는다.

### Overlay와 피드백

- 선택 메뉴: `DropdownMenu`
- 모바일 사이드바와 보조 패널: `Sheet`
- 삭제·탈퇴 등 확인이 필요한 행동: `AlertDialog`
- 짧은 보조 설명: `Tooltip`
- 로딩 자리 표시자: `Skeleton`

## 7. 반복 UI 패턴

### 페이지 헤더

헤더는 제목·설명 그룹과 우측 액션 그룹으로 나눈다.

```tsx
<div className="flex items-end justify-between gap-4">
  <div>
    <h1 className="text-xl font-semibold">제목</h1>
    <p className="text-muted-foreground mt-1 text-sm">설명</p>
  </div>
  <div className="flex items-center gap-2">{/* actions */}</div>
</div>
```

관리 화면의 최상위 제목만 기존 패턴에 따라 `text-2xl font-bold`을 사용할 수 있다.

### 검색과 필터

게시물 및 신고 목록의 현재 검색·필터 조합을 재사용한다.

- 외곽 컨테이너: `bg-background`, `border`, `rounded-*`
- 필터 트리거, 선택 수 배지, 구분선, 검색 아이콘, 입력, 초기화 액션 순서
- 선택된 필터: `bg-primary/10 text-primary rounded-full`
- 여러 태그: `flex flex-wrap gap-2`
- 입력 자체의 중복 외곽선은 제거하고 컨테이너의 focus ring을 사용

이 패턴이 세 화면 이상에서 반복되므로 전체 디자인 정리 시 공용 컴포넌트로 추출한다.

### 상태 표시

| 상태 | 표현 |
| --- | --- |
| 로딩 | 실제 레이아웃과 유사한 `Skeleton` 또는 중앙 보조 텍스트 |
| 빈 결과 | `py-8` 또는 `py-12`, 중앙 정렬, `text-muted-foreground` |
| 찾을 수 없음 | `Card` 안에 아이콘, 제목, 설명 |
| 오류 | `text-destructive`; 필요한 경우 오류 배경과 테두리 병행 |
| 비활성 | 공용 컴포넌트의 `disabled`와 opacity 처리 |
| 성공·연결 | 아이콘과 텍스트를 함께 사용 |

색만으로 상태를 구분하지 않는다.

### 페이지네이션

간단한 이전·다음 이동은 `outline` + `sm` 버튼, 현재 페이지는 `text-sm text-muted-foreground`를 사용한다. 페이지 수 탐색이 필요한 목록은 공용 `Pagination` 컴포넌트를 사용한다.

## 8. 아이콘과 상호작용

- 아이콘은 `lucide-react`에서 가져온다.
- 일반 아이콘은 `size-4`, 작은 메타데이터는 `size-3` 또는 `size-3.5`를 사용한다.
- 아이콘과 텍스트는 `gap-1` 또는 `gap-1.5`로 묶는다.
- 아이콘 단독 액션은 `Button`의 icon 크기와 스크린 리더용 이름을 사용한다.
- hover뿐 아니라 `focus-visible` 상태를 유지한다.
- 클릭 가능한 요소에는 `cursor-pointer`를 개별 추가하기보다 의미에 맞는 `Button` 또는 링크를 사용한다.

## 9. 현재 구현에서 표준으로 삼지 않는 예외

다음은 현재 코드에 존재하지만 재사용 기준은 아니다. 전체 디자인 정리 시 의미 기반 토큰이나 공용 컴포넌트로 치환한다.

- `bg-white`, `bg-gray-*`, `text-gray-*` 등의 직접 색상
- 상태별 `bg-green-*`, `bg-yellow-*` 하드코딩
- 정의되지 않은 것으로 보이는 `border-black-2`
- 공용 `Button` 대신 스타일을 반복한 raw `<button>`
- 같은 역할에서 서로 다른 페이지 제목 크기와 바깥 여백
- 게시물·신고 화면에 복제된 검색·필터 마크업
- 텍스트만 있는 로딩·빈 결과·오류 표현의 화면별 편차

치환 과정에서 새로운 색이나 컴포넌트 변형을 만들지 않는다. 먼저 기존 의미 토큰과 variant로 역할을 표현한다.

## 10. 새 화면 작성 절차

1. 화면을 목록, 상세, 설정, 카드 그리드, 인증 중 하나로 분류한다.
2. 대응하는 기존 컨테이너와 페이지 헤더 패턴을 가져온다.
3. `src/components/ui`에서 필요한 컴포넌트를 조합한다.
4. 색상은 의미 토큰만 사용한다.
5. 정상·로딩·빈 결과·오류·비활성 상태를 함께 구현한다.
6. 모바일 기본 배치와 `md`·`lg` 확장을 확인한다.
7. 키보드 포커스, label, 접근 가능한 이름을 확인한다.
8. 비슷한 마크업이 세 번째로 반복되면 공용 패턴으로 추출한다.

## 11. 리뷰 체크리스트

- [ ] 기존 페이지 유형의 컨테이너 폭과 여백을 재사용했는가?
- [ ] 제목과 보조 설명의 계층이 기존 패턴과 같은가?
- [ ] 모든 색상이 `src/index.css`의 의미 토큰을 사용하는가?
- [ ] `Button`, `Card`, `Field`, `Item`, `Table`을 우선 사용했는가?
- [ ] 버튼 variant가 행동의 중요도와 위험도를 반영하는가?
- [ ] 로딩·빈 결과·오류·비활성 상태가 있는가?
- [ ] 아이콘만 있는 컨트롤에 접근 가능한 이름이 있는가?
- [ ] 모바일에서 줄바꿈, 사이드바, 표가 동작하는가?
- [ ] 같은 UI가 페이지 안에 다시 복제되지 않았는가?
- [ ] 라이트·다크 토큰 구조를 깨는 직접 색상이 없는가?

## 12. 전체 디자인 정리 범위

전체 화면을 손볼 때 시각 스타일을 새로 설계하지 않고 다음 순서로 현행 디자인을 정렬한다.

1. 직접 색상과 잘못된 유틸리티를 의미 토큰으로 교체
2. 페이지 컨테이너와 헤더 계층 통일
3. 반복 검색·필터를 공용 컴포넌트로 추출
4. raw 컨트롤을 공용 UI 컴포넌트로 교체
5. 로딩·빈 결과·오류 패턴 통일
6. 반응형과 키보드 접근성 검증

이 문서와 구현이 다르면 `src/index.css` 및 `src/components/ui`의 현재 동작을 먼저 확인한다. 공용 디자인 결정이 바뀌면 구현과 이 문서를 같은 변경에서 함께 갱신한다.
