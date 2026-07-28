# Open Specification (Openspec) - Frontend App

이 문서는 `c:\Users\hys\Desktop\design-test\src` 디렉토리의 소스코드를 분석하여 작성한 통합 화면 및 API 명세서입니다. 본 어플리케이션은 블로그 포스트 수집 및 관리, 사용자 상호작용(댓글, 북마크, 신고), 그리고 관리자 기능(신고 관리, 수집 제공자 설정)을 아우르는 서비스입니다.

---

## 0. 공통 아키텍처 및 레이아웃

### 1) 라우팅 구조 (`src/routes.tsx`)

- 라우팅은 `react-router`의 `createBrowserRouter`를 통해 구성되어 있습니다.
- 애플리케이션은 **인증 레이아웃(`SignLayout`)**과 **메인 레이아웃(`PageLayout`)** 두 가지 핵심 레이아웃으로 분기됩니다.

| 경로 | 컴포넌트 | 레이아웃 | 비고 |
| :--- | :--- | :--- | :--- |
| `/signin` | `SignIn` | `SignLayout` | 로그인 화면 (비인증) |
| `/signup` | `SignUp` | `SignLayout` | 회원가입 화면 (비인증) |
| `/` | `PostList` | `PageLayout` | 홈 (포스트 목록 조회) |
| `/post` | `PostDetail` | `PageLayout` | 포스트 상세 정보 및 댓글/신고 |
| `/my/info` | `MyInfo` | `PageLayout` | 회원 정보 및 프로필 관리 (`ProtectedRoute`) |
| `/my/bookmark` | `MyBookmark` | `PageLayout` | 북마크 목록 관리 (`ProtectedRoute`) |
| `/my/comment` | `MyComment` | `PageLayout` | 작성 댓글 목록 관리 (`ProtectedRoute`) |
| `/management/report/post` | `ManagementReportPost` | `PageLayout` | 관리자 - 포스트 신고 내역 관리 |
| `/management/report/comment` | `ManagementReportComment` | `PageLayout` | 관리자 - 댓글 신고 내역 관리 |
| `/management/provider-setting` | `ManagementProviderSetting` | `PageLayout` | 관리자 - 수집 제공자(Provider) 설정 |
| `*` | `NotFoundRedirect` | - | 예외 경로 진입 시 `/`로 리다이렉트 |

### 2) 인증 및 보안 정책 (`ProtectedRoute`)

- 마이페이지 계열(`/my/info`, `/my/bookmark`, `/my/comment`)은 `ProtectedRoute` 컴포넌트로 래핑되어 있어, 로그인 상태가 아닌 세션의 접근을 차단하고 인증을 강제합니다.

### 3) 레이아웃 구성

- **SignLayout**: 인증 단계(`SignIn`, `SignUp`)에서 사용하며, 주로 단일 카드 레이아웃과 중앙 정렬을 제공합니다.
- **PageLayout**: 상단 네비게이션 헤더 및 사이드바 바인딩을 포함하는 공통 프레임워크 레이아웃입니다.

---

## 1. 인증 및 가입

### 1) 로그인 페이지 (`SignIn`)

- **경로**: `/signin`
- **UI 정의**:
  - `Card` 컴포넌트 내부에 아이디, 비밀번호 입력 필드 배치.
  - 비밀번호 노출은 `password` 타입으로 가려짐.
  - 로그인 실행 단추 제공.
  - 하단에 "계정이 없으신가요? 회원가입" 링크 배치 (클릭 시 `/signup` 이동).
- **비즈니스 로직**:
  - 아이디 혹은 비밀번호 누락 시 프론트엔드 자체 에러 텍스트 표출: `아이디와 비밀번호를 입력해 주세요.`
  - 로그인 성공 시 메인 페이지(`/`)로 이동하며 화면을 교체(`replace: true`).
  - 로그인 실패 시 API가 반환하는 에러 메시지를 수집하여 패스워드 필드 하단 에러 메시지로 노출.
  - API 통신 중에는 인풋 필드 및 제출 단추 비활성화(`disabled`).
- **연동 API Spec**:

```yaml
openapi: 3.0.3
paths:
  /auth/v1/auth/login:
    post:
      summary: "직접 가입 계정 로그인"
      description: "사용자가 입력한 아이디와 패스워드를 검증하여 JWT 액세스/리프레시 토큰을 발급합니다."
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - login_id
                - password
              properties:
                login_id:
                  type: string
                  example: "user123"
                password:
                  type: string
                  example: "password123"
      responses:
        200:
          description: "로그인 성공"
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  refresh_token:
                    type: string
```

---

### 2) 회원가입 페이지 (`SignUp`)

- **경로**: `/signup`
- **UI 정의**:
  - 닉네임, 아이디(로그인 ID), 자기소개(introduction, Textarea), 비밀번호, 비밀번호 확인 필드.
  - 회원가입 완료 버튼.
  - 하단에 "이미 계정이 있으신가요? 로그인" 링크 배치 (클릭 시 `/signin` 이동).
- **비즈니스 로직**:
  - **입력값 사전 유효성 검증**:
    1. 필수값(닉네임, 아이디, 비밀번호, 비밀번호 확인) 누락 시: `필수 항목을 모두 입력해 주세요.`
    2. 비밀번호 길이 8자 미만 시: `비밀번호는 8자 이상이어야 합니다.`
    3. 비밀번호와 비밀번호 확인 불일치 시: `비밀번호가 일치하지 않습니다.`
  - 가입 성공 시 로그인 페이지(`/signin`)로 교체(`replace: true`) 이동.
  - 가입 실패 시 API 에러 메시지를 가입 폼 하단에 경고로 노출.
- **연동 API Spec**:

```yaml
openapi: 3.0.3
paths:
  /user/v1/users:
    post:
      summary: "직접 회원가입"
      description: "새로운 로컬 사용자 계정을 생성합니다."
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - login_id
                - password
                - password_confirm
                - nickname
              properties:
                login_id:
                  type: string
                password:
                  type: string
                password_confirm:
                  type: string
                nickname:
                  type: string
                introduction:
                  type: string
      responses:
        200:
          description: "가입 성공"
          content:
            application/json:
              schema:
                type: object
                properties:
                  user_id:
                    type: string
                  created_at:
                    type: string
```

---

## 2. 포스팅 도메인

### 1) 포스트 목록 페이지 (`PostList`)

- **경로**: `/` (Home)
- **UI 정의**:
  - `PostingFilter` 컴포넌트: 통합 필터 구조.
    - 필터 버튼 클릭 시 드롭다운 표출 (제공자 카테고리: '토스', '카카오', '네이버', '라인' 다중 선택 체크박스).
    - 선택 건수가 필터 버튼 옆 배지 수로 표출됨.
    - 활성화된 필터 카테고리는 하단에 독립된 태그 형태로 노출되며 X를 눌러 삭제하거나 '선택 초기화' 가능.
    - 우측에 검색어 입력 인풋바 및 지우기(X) 버튼 내장.
  - 포스팅 총 개수 및 총 페이지 정보 표출 (`총 N개 · M 페이지`).
  - 카드 형태 포스트 리스트: 썸네일/아이콘(BadgeCheckIcon), 글 제목, 작성일(YYYY-MM-DD 포맷), 좋아요 수, 조회수 표출.
  - 하단 페이지네이션 그룹: 이전, 블록별 페이지 단추(최대 10개 나열), 다음 버튼.
  - 페이지당 표출 크기 드롭다운: 기본 20개 (10, 20, 50, 100개 중 선택 가능).
- **비즈니스 로직**:
  - 컴포넌트 마운트 시 및 페이지 번호, 한 페이지당 크기, 검색어 상태 변경 시 API 호출하여 목록 갱신.
  - 검색어 입력 및 필터 선택 변경 시 페이지 상태를 `1`로 자동 리셋 후 쿼리 수행.
  - 리스트의 포스트 클릭 시 `/post?post-id=${post.id}` 로 쿼리 파라미터를 담아 이동.
- **연동 API Spec**:

```yaml
openapi: 3.0.3
paths:
  /api/v1/postings:
    get:
      summary: "포스팅 목록 조회"
      description: "필터 및 페이징 파라미터에 따라 블로그 포스팅 목록을 가져옵니다."
      parameters:
        - name: page
          in: query
          required: false
          schema:
            type: integer
            default: 0
        - name: size
          in: query
          required: false
          schema:
            type: integer
            default: 10
        - name: provider_id
          in: query
          required: false
          schema:
            type: string
        - name: title
          in: query
          required: false
          schema:
            type: string
      responses:
        200:
          description: "조회 성공"
          content:
            application/json:
              schema:
                type: object
                properties:
                  total:
                    type: integer
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/PostingListItem'

components:
  schemas:
    PostingListItem:
      type: object
      properties:
        id:
          type: string
        provider_id:
          type: string
        title:
          type: string
        published_at:
          type: string
        thumbnail_url:
          type: string
        summary:
          type: string
        status:
          type: integer
        social:
          type: object
          properties:
            like_count:
              type: integer
            view_count:
              type: integer
            is_liked:
              type: boolean
            is_bookmarked:
              type: boolean
            comment_count:
              type: integer
```

---

### 2) 포스트 상세 페이지 (`PostDetail`)

- **경로**: `/post` (예: `/post?post-id=xxxx`)
- **UI 정의**:
  - 포스트 메인 본문 카드:
    - 상단: 포스트 제목, 등록 날짜, 조회수.
    - 본문: 포스트 요약본(`post.summary`) 표시.
    - '본문으로 이동하기' 외부 브라우저 새 창 링크 버튼.
    - 하단 액션 버튼 그룹:
      - 좋아요 토글 버튼 (현재 좋아요 카운트 표시, 활성화 시 채워진 하트 아이콘).
      - 즐겨찾기(북마크) 토글 버튼 (활성화 시 채워진 북마크 아이콘).
      - 신고 버튼 및 드롭다운 메뉴 (포스트 오류, 링크 오류, 기타 신고 단추 제공).
  - 기타 신고 폼 모달 (`AlertDialog`): 기타 신고 사유 입력 영역(Textarea), 취소, 신고하기 버튼.
  - 댓글 섹션:
    - 상단: 댓글 총 개수 표출.
    - 댓글 및 답글 입력창: 답글 대상 선택 시 `@{userId}님에게 답글 작성 중 [취소]` 알림 표시 제공.
    - 댓글 목록 트리:
      - 댓글 정보: 프로필 아이콘, 작성자 ID, 작성일, 댓글 내용, 답글 달기 버튼, 사이렌(신고) 단추.
      - 대댓글(답글) 정보: 1단 들여쓰기 적용, `@원댓글작성자` 멘션 하이라이트 표시, 내용, 답글 버튼, 신고 단추.
      - 답글 페이징: `답글 더보기 (현재개수/총개수)` 버튼으로 대댓글 페이징 처리.
      - 댓글 페이징네이션: 댓글이 많을 경우 하단에 이전, 페이지 번호, 다음 버튼 바인딩.
- **비즈니스 로직**:
  - `post-id` 쿼리 파라미터 부재 시 혹은 로드 실패 시 예외 카드뷰 노출 ("포스트를 찾을 수 없습니다").
  - 좋아요/북마크 클릭 시 즉시 토글 API를 호출하고 성공 시 상세 데이터를 다시 조회하여 상태를 동기화.
  - **포스트 신고**:
    - '포스트 오류', '링크 오류' 신고 클릭 시 확인 얼럿과 함께 즉시 API 통신 및 창 닫기.
    - '기타 신고' 클릭 시 내용 입력 다이얼로그를 통해 수집된 내용으로 전송.
  - **댓글/답글 신고**:
    - 사이렌 아이콘 클릭 시 정치, 성인, 기타 버튼 그룹 노출.
    - 정치/성인은 즉시 접수 처리, 기타는 모달을 띄워 사유 입력 후 접수.
  - **댓글/대댓글 작성**:
    - 대댓글의 경우 `parent_comment_id`를 실어서 전송.
    - 전송 완료 시 입력란을 초기화하고 타겟 노드를 해제하며 해당 댓글 스레드의 목록을 갱신.
- **연동 API Spec**:

```yaml
openapi: 3.0.3
paths:
  /api/v1/postings/{posting_id}:
    get:
      summary: "포스트 상세 조회"
      responses:
        200:
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                  title:
                    type: string
                  url:
                    type: string
                  summary:
                    type: string
                  created_at:
                    type: string
                  social:
                    type: object
                    properties:
                      like_count:
                        type: integer
                      view_count:
                        type: integer
                      is_liked:
                        type: boolean
                      is_bookmarked:
                        type: boolean

  /api/v1/postings/{posting_id}/likes:
    post:
      summary: "포스트 좋아요 등록"
    delete:
      summary: "포스트 좋아요 해제"

  /api/v1/postings/{posting_id}/bookmarks:
    post:
      summary: "포스트 북마크 등록"
    delete:
      summary: "포스트 북마크 해제"

  /api/v1/postings/{posting_id}/reports:
    post:
      summary: "포스팅 신고 접수"
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                reason_type:
                  type: string
                  enum: [POST_ERROR, LINK_ERROR, OTHER]
                content:
                  type: string

  /api/v1/postings/{posting_id}/comments:
    get:
      summary: "댓글 목록 조회"
      parameters:
        - name: page
          in: query
        - name: size
          in: query
        - name: parent_comment_id
          in: query
    post:
      summary: "댓글 생성"
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                content:
                  type: string
                parent_comment_id:
                  type: string

  /api/v1/comments/{comment_id}/replies:
    get:
      summary: "대댓글 목록 조회"
    post:
      summary: "대댓글 작성"
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                content:
                  type: string

  /api/v1/comments/{comment_id}/reports:
    post:
      summary: "댓글 신고 접수"
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                reason_type:
                  type: string
                  enum: [POLITICS, ADULT, OTHER]
                content:
                  type: string
```

---

## 3. 마이페이지 (My)

### 1) 회원 정보 관리 페이지 (`MyInfo`)

- **경로**: `/my/info`
- **UI 정의**:
  - 계정 정보 카드: 로그인한 유저의 아이디, 자기소개 요약본, Google 연동 활성화 여부(연동됨: 초록 체크 아이콘, 비연동: 회색 엑스 아이콘) 표출.
  - 프로필 수정 카드: 닉네임 인풋(디폴트 바인딩), 자기소개 Textarea, '프로필 저장' 버튼.
  - 비밀번호 변경 카드: 현재 비밀번호, 새 비밀번호, 새 비밀번호 확인 필드, '비밀번호 변경' 버튼.
  - 탈퇴 구역: '탈퇴하기' 단추 및 경고 AlertDialog (탈퇴 시 영구 삭제 동의 경고문 제공).
- **비즈니스 로직**:
  - 프로필 저장 시 닉네임 입력 여부를 사전에 검사(미입력 시 경고). 값이 기기본 정보와 다를 때만 저장 단추 활성화. 저장 완료 시 `저장됨 ✓` 피드백이 2초간 제공됨.
  - 비밀번호 수정 전 폼 입력 필수값 및 비밀번호 8자 이상 검사, 새 비밀번호 확인 일치 조건 검사 수행. 변경 완료 시 인풋 폼 전체가 초기화되며 `변경됨 ✓` 피드백 노출.
  - 탈퇴 승인 시 탈퇴 API 호출 완료 후 로그인 화면(`/login`)으로 경로 이동 처리.
- **연동 API Spec**:

```yaml
openapi: 3.0.3
paths:
  /user/v1/users/me:
    get:
      summary: "내 프로필 상세 조회"
      responses:
        200:
          content:
            application/json:
              schema:
                type: object
                properties:
                  user_id:
                    type: string
                  nickname:
                    type: string
                  introduction:
                    type: string
                  login_type:
                    type: string
    patch:
      summary: "프로필 수정"
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                nickname:
                  type: string
                introduction:
                  type: string
    delete:
      summary: "회원 탈퇴"

  /user/v1/users/me/password:
    patch:
      summary: "비밀번호 수정"
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                password:
                  type: string
                new_password:
                  type: string
                new_password_confirm:
                  type: string
```

---

### 2) 북마크 목록 페이지 (`MyBookmark`)

- **경로**: `/my/bookmark`
- **UI 정의**:
  - 페이지 상단에 저장된 총 북마크의 개수 정보와 페이징 처리를 위한 단순 [이전] [현재페이지번호] [다음] 단추 조합 제공.
  - 북마크 테이블 목록:
    - 컬럼: 해제, 제목, 포스트 등록일, 북마크 등록일.
    - 해제 컬럼: 굳게 칠해진 북마크 아이콘 단추 (클릭 시 북마크 즉시 취소).
    - 제목 컬럼: 링크 스타일 단추로 구성 (클릭 시 상세 정보 페이지 `/post?post-id=xxx`로 포워딩).
- **비즈니스 로직**:
  - 북마크 목록 API 조회 후 얻어온 `postId`들을 개별 루프하며 포스트 상세 데이터를 조회하여 화면상의 제목 및 포스트 등록일을 동기화함.
  - 해제 클릭 시 `window.confirm` 창을 호출하여 사용자 의사 결정 재차 확인.
  - 삭제 완료 시 만일 해당 페이지의 유일한 요소였고 `page > 0`인 경우 이전 페이지로 가며, 그 외엔 현 페이지 재호출.
- **연동 API Spec**:

```yaml
openapi: 3.0.3
paths:
  /api/v1/me/bookmarks:
    get:
      summary: "내 북마크 리스트 조회"
      parameters:
        - name: page
          in: query
        - name: size
          in: query
      responses:
        200:
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      type: object
                      properties:
                        post_id:
                          type: string
                        created_at:
                          type: integer
```

---

### 3) 내가 작성한 댓글 목록 페이지 (`MyComment`)

- **경로**: `/my/comment`
- **UI 정의**:
  - 작성 댓글 총 건수 라벨 및 페이징 바인딩.
  - 댓글 테이블 구조:
    - 컬럼: 포스트(ID 링크 단추), 댓글 내용(최대폭 제한 및 말줄임), 작성일, 삭제 단추(쓰레기통 아이콘).
- **비즈니스 로직**:
  - 테이블 행 내 포스트 번호 클릭 시 해당 글 상세 페이지(`/post?post-id=xxx`)로 라우팅.
  - 쓰레기통 단추 클릭 시 `window.confirm('댓글을 삭제하시겠습니까?')` 창 노출 후 API 삭제 요청.
  - 페이지 잔여 글이 1개이고 이전 페이지가 존재할 때 자동 페이징 조정.
- **연동 API Spec**:

```yaml
openapi: 3.0.3
paths:
  /api/v1/me/comments:
    get:
      summary: "내가 작성한 댓글 목록조회"
      responses:
        200:
          content:
            application/json:
              schema:
                type: object
                properties:
                  total_count:
                    type: integer
                  items:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        post_id:
                          type: string
                        content:
                          type: string
                        created_at:
                          type: string

  /api/v1/comments/{comment_id}:
    delete:
      summary: "댓글 단건 삭제"
```

---

## 4. 관리자 도메인 페이지

### 1) 포스트 신고 관리 페이지 (`PostReport`)

- **경로**: `/management/report/post`
- **UI 정의**:
  - 상단 필터 바:
    - 드롭다운: 신고 유형(포스트 오류, 링크 오류, 기타), 신고 상태(대기중 OPEN, 처리완료 DONE), 일자 범위(DateFrom, DateTo) 선택 가능.
    - 검색바: 포스트 ID, 신고자 ID, 신고 내용 키워드 매치 인풋바.
  - 테이블 리스트:
    - 컬럼: 포스트 ID, 신고자 ID, 신고 유형, 신고 날짜, 신고 내용, 신고 상태 배지(OPEN: 노란색, DONE: 초록색), 액션 메뉴.
    - 액션 메뉴 클릭 시 '대기중으로 변경(OPEN)', '처리완료(DONE)' 토글 팝업 호출.
  - 하단: 총 건수 표시 및 페이징 조작 영역.
- **비즈니스 로직**:
  - 필터 상태 변경 시, 페이지 색인을 `0`으로 재조정하여 데이터 갱신.
  - 검색어 입력 시, 기조회된 응답 배열 내에서 `postId`, `userId`, `reportTypeCode`, `content` 문자열을 대상으로 메모이징된(Client-side) 부분 일치 필터링을 동적으로 처리함.
- **연동 API Spec**:

```yaml
openapi: 3.0.3
paths:
  /api/v1/admin/reports/postings:
    get:
      summary: "어드민 포스팅 신고 목록 조회"
      parameters:
        - name: page
          in: query
        - name: size
          in: query
        - name: reason_type
          in: query
        - name: status
          in: query
        - name: start_date
          in: query
        - name: end_date
          in: query

  /api/v1/admin/reports/postings/{report_id}:
    patch:
      summary: "신고 처리 상태 변경"
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  enum: [OPEN, DONE]
```

---

### 2) 댓글 신고 관리 페이지 (`CommentReport`)

- **경로**: `/management/report/comment`
- **UI & 기능 사양**:
  - 포스트 신고 관리 페이지(`PostReport`)와 대부분 동일한 골격(필터, 검색바, 테이블, 페이징)을 공유합니다.
  - 차이점:
    - 신고 유형 항목: `정치`, `성인`, `기타`
    - 테이블 컬럼에 `댓글 ID`가 추가되어 표출됩니다.
    - 클라이언트 검색 필터 대상에 `commentId`가 포함됩니다.
- **연동 API Spec**:

```yaml
openapi: 3.0.3
paths:
  /api/v1/admin/reports/comments:
    get:
      summary: "어드민 댓글 신고 목록 조회"

  /api/v1/admin/reports/comments/{report_id}:
    patch:
      summary: "댓글 신고 처리 상태 변경"
```

---

### 3) 제공자 설정 페이지 (`ProviderSetting`)

- **경로**: `/management/provider-setting`
- **UI 정의**:
  - 우측 상단 '제공자 추가' 버튼 배치.
  - 제공자 카드 그리드:
    - 카드 내부: 제공자 이름 명시, 사용 상태 배지(활성: 초록, 비활성: 회색), 기본 URL(font-mono 스타일 적용), 수정 시기, 하단 '설정 변경' 단추 배치.
  - 제공자 추가 모달: 이름, 설명, URL 입력란 및 상태 활성 스위치(Switch) 바인딩.
  - 설정 변경 모달: 상태 배지, 이름(수정 불가 비활성화 표시), 설명, URL, 상태 변경 토글 스위치, 우측 상단 '삭제' 휴지통 아이콘 바인딩.
    - 단, 사용 중인 수집 소스가 있는 대상인 경우 휴지통 아이콘이 비활성 처리되며 하단에 "사용 중인 수집 소스가 있어 이 제공자는 삭제할 수 없습니다." 경고 라벨 표출.
  - 제공자 삭제 모달: 되돌릴 수 없는 삭제 실행 최종 의사 확인용 심플 팝업창.
- **비즈니스 로직**:
  - 신규 등록 및 수정 작업 시 필수 기재값(이름, URL) 누락 확인 후 트랜잭션 전송.
  - 수집 소스 사용 연동 상태(`hasUsingCollectSource`) 여부에 따른 안전한 삭제 가드 처리.
- **연동 API Spec**:

```yaml
openapi: 3.0.3
paths:
  /collect/v1/providers:
    get:
      summary: "수집 제공자 목록 조회"
    post:
      summary: "수집 제공자 신규 등록"
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                base_url:
                  type: string
                description:
                  type: string
                is_used:
                  type: boolean

  /collect/v1/providers/{provider-id}:
    get:
      summary: "수집 제공자 단일 조회"
    patch:
      summary: "수집 제공자 정보 변경"
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                base_url:
                  type: string
                description:
                  type: string
                is_used:
                  type: boolean
    delete:
      summary: "수집 제공자 정보 삭제"
```

---

## 5. 코드 분석 중 발견된 불일치/이슈 사항 정리

> [!WARNING]
> 소스코드 상에 기획서 설계 또는 엔드포인트 명칭 변경 과정에서 잔존한 것으로 추정되는 불일치 사항들을 정리합니다. 향후 유지보수 시 확인이 권장됩니다.

1. **마이페이지 홈 리다이렉트 미스매치 (`src/pages/My/index.tsx`)**:
   - 사용자가 `/my` 주소로 접근할 때 `/my/favorite` 경로로 리다이렉트 처리하도록 지정되어 있습니다.
   - 그러나 실제 `routes.tsx` 상에 선언되어 매핑된 라우트는 `/my/bookmark` 입니다. 이로 인해 `/my` 접근 시 존재하지 않는 라우트로 리다이렉트되어 예외 핸들러에 의해 메인 홈(`/`)으로 튕겨 나갈 우려가 있습니다.
2. **회원탈퇴 완료 후 리다이렉트 경로 오류 (`src/pages/My/Info/index.tsx` L143)**:
   - `handleDeleteAccount` 함수 내에서 탈퇴 요청 성공 후 `navigate('/login')`로 경로 이동을 하고 있으나, 실제 매핑된 로그인 라우트명은 `/signin` 입니다. 이에 따라 404 혹은 홈 페이지로 튕기는 오작동이 나타날 수 있습니다.
3. **포스트 목록 페이지당 보기 옵션의 드롭다운 불일치 (`src/pages/Post/PostList/index.tsx` L29-30)**:
   - 기본 `pageSize` 상태는 `defaultPagination = paginationOptions[1]`로 계산되므로 **20개**가 디폴트입니다.
   - 그러나 실제 컴포넌트 마운트 및 API 최초 조회의 파라미터는 20개 기준으로 실행되지만, UI 컴포넌트에는 드롭다운에 초기 바인딩 시 정확히 일치하지 않는 컴포넌트 노출 상태가 확인될 가능성이 있으니 정렬 처리가 필요합니다.
