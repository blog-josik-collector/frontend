# Open Questions

## 확인된 충돌과 불일치

1. `ProtectedRoute`의 `hasAuth`가 항상 `true`다. `/my/*`는 외형상 보호되지만 현재 실행 코드로는 비인증 접근을 막지 않는다.
2. 관리자 페이지에는 인증·역할 검사가 없다. `UserMe.userType`은 존재하지만 접근 제어에 사용되지 않는다.
3. 401 interceptor와 회원 탈퇴 성공 후 이동 경로가 `/login`이지만 실제 로그인 route는 `/signin`이다. 와일드카드가 최종적으로 `/`로 보낸다.
4. `src/pages/My/index.tsx`는 `/my/favorite`로 이동하지만 route는 `/my/bookmark`다. 이 컴포넌트 자체도 라우터에 등록되지 않았다.
5. `src/pages/Management/index.tsx`와 `src/pages/Management/Post/index.tsx`는 라우터에 등록되지 않았다.
6. PostList의 `PostingFilter.selected`는 화면 상태만 바꾸고 `provider_id` 또는 다른 API query로 전달되지 않는다.
7. PostList는 Zustand의 `loading`과 `error`를 구조 분해하지 않아 조회 로딩·오류·빈 상태를 구분해서 표시하지 않는다.
8. `GetPostingCommentsResponse.total_count` 타입이 `string`인 반면 다른 목록의 count는 `number`다. mock도 문자열을 반환하지만 실제 API 계약은 확인 필요하다.
9. PostDetail은 별도 replies service/store 대신 postings comments API에 `parent_comment_id`를 전달해 답글을 조회·생성한다. replies API hooks는 UI에서 사용되지 않는다.
10. PostDetail 댓글 작성 store는 실패를 throw하지 않고 `undefined`를 반환하므로 페이지의 `try/catch` 실패 alert가 실행되지 않을 수 있다.
11. MyBookmark는 전체 건수를 받지 않아 다음 페이지 존재 여부를 현재 페이지의 항목 수로 추정한다.
12. provider 삭제 제한은 UI에서 `hasUsingCollectSource`로만 버튼을 막는다. API가 동일 규칙을 강제하는지는 코드로 확정할 수 없다.
13. OAuth 병합, source/job/collect posting 기능은 service/store까지 구현됐으나 페이지가 없다.
14. `src/pages` 일부 한글 문자열과 주석이 소스/터미널에서 깨진 인코딩으로 보인다. 원래 문구는 코드 동작만으로 복원하지 않았다.

## 테스트와 계약

- 저장소에 별도 테스트 파일이 없다.
- 개발 환경에서는 MSW가 자동 시작되며 44개 endpoint 모두에 대응하는 mock handler가 있다.
- 성공 status는 mock에서 일부 201/202를 사용하지만 service 함수는 status를 검사하지 않고 응답 body만 사용한다.
- refresh token 재발급 로직은 없다. refresh token은 저장·삭제만 된다.
- 파일 업로드·다운로드와 multipart 요청은 없다.
- API base URL의 실제 배포 값과 서버별 권한 규칙은 저장소만으로 확정할 수 없다.
