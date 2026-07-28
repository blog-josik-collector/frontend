# Collection Specification

## Purpose

외부 콘텐츠 제공자, 수집 source, 수집 job, 수집 결과 상세의 현재 frontend 계약을 정의한다.

## Scope

ProviderSetting UI 및 `src/services/collect`, `src/stores/collect` 전체.

## Related Pages

- `src/pages/Management/ProviderSetting/index.tsx`
- source/job/result에 연결된 page는 없음

## Related Stores

- `providersStore.ts`
- `sourcesStore.ts`
- `jobsStore.ts`
- `postingsStore.ts`

## Related Services

- `src/services/collect/index.ts`

## Requirements

### Requirement: 관리자는 Provider 목록을 조회·등록할 수 있어야 한다

#### Scenario: 목록 조회

- GIVEN provider 설정 화면이 열리고
- WHEN 목록 query가 성공하면
- THEN provider 이름, URL, 설명, 사용 상태, 수정일을 카드로 표시해야 한다.

#### Scenario: 로딩·오류·빈 상태

- GIVEN 목록 query 상태가 변하고
- WHEN 화면을 렌더링하면
- THEN 로딩, 조회 실패, 등록된 provider 없음 상태를 구분해 표시해야 한다.

#### Scenario: Provider 등록

- GIVEN 이름과 base URL이 입력되고
- WHEN 생성 API가 성공하면
- THEN 목록을 재조회하고 등록 폼을 초기화해야 한다.

### Requirement: 관리자는 Provider를 수정·삭제할 수 있어야 한다

#### Scenario: Provider 수정

- GIVEN 선택한 provider와 비어 있지 않은 URL이 있고
- WHEN 수정이 성공하면
- THEN 목록과 해당 상세 query를 무효화하고 다이얼로그를 닫아야 한다.

#### Scenario: 사용 중 Provider 삭제 제한

- GIVEN `hasUsingCollectSource`가 true이고
- WHEN 편집 다이얼로그를 표시하면
- THEN 삭제 버튼을 비활성화하고 제한 안내를 표시해야 한다.

#### Scenario: Provider 삭제 성공

- GIVEN 삭제 가능한 provider에 사용자가 삭제를 확인하고
- WHEN API가 성공하면
- THEN 목록을 재조회하고 해당 상세 cache를 제거해야 한다.

### Requirement: Source 관리 계약을 제공해야 한다

#### Scenario: Source CRUD 성공

- GIVEN 호출자가 source 생성·조회·수정·삭제 hook을 사용하고
- WHEN 각 API가 성공하면
- THEN source cache와 연관 provider 목록을 구현된 규칙에 따라 갱신해야 한다.

#### Scenario: Source ID 없음

- GIVEN 빈 source ID로 상세 hook을 호출하고
- WHEN hook이 렌더링되면
- THEN 상세 query를 실행하지 않아야 한다.

### Requirement: 수집 Job과 결과 조회 계약을 제공해야 한다

#### Scenario: Job 시작 또는 중지

- GIVEN source ID가 있고
- WHEN start/stop mutation이 성공하면
- THEN job 목록과 source 상세 query를 무효화해야 한다.

#### Scenario: Job 목록·상세 조회

- GIVEN page 조건 또는 job ID가 있고
- WHEN 조회가 성공하면
- THEN 변환된 job entity를 query cache에 저장해야 한다.

#### Scenario: 수집 게시물 조회

- GIVEN posting ID가 있고
- WHEN 수집 게시물 API가 성공하면
- THEN source, URL, 게시일, 오류 수, 최근 수집 job 정보를 cache해야 한다.

## State Behavior

- 모든 collection store는 React Query 기반이다.
- 생성·수정·삭제 성공 시 연관 list/detail을 invalidate 또는 remove한다.
- ID 기반 query는 ID가 비어 있으면 비활성화된다.

## API Dependencies

- `/collect/v1/providers*`
- `/collect/v1/sources*`
- `/collect/v1/sources/{sourceId}/_start|_stop`
- `/collect/v1/jobs*`
- `/collect/v1/postings/{postingId}`

## Error Handling

ProviderSetting은 조회와 mutation 오류를 표시한다. UI가 없는 source/job/result는 React Query 오류 상태만 제공한다.

## Open Questions

- source/job/result를 실제로 조작할 화면은 구현되지 않았다.
- provider 삭제 제한이 서버에서도 보장되는지는 확인할 수 없다.
- job status와 trigger type의 허용 enum은 코드에서 string으로만 정의된다.
