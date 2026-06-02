import { authHandlers } from '@mocks/services/auth';
import { collectHandlers } from '@mocks/services/collect';
import { commentHandlers } from '@mocks/services/comment';
import { postingsHandlers } from '@mocks/services/posting';
import { reportHandlers } from '@mocks/services/report';
import { userHandlers } from '@mocks/services/user';

// 전체 핸들러 목록
export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...postingsHandlers,
  ...commentHandlers,
  ...reportHandlers,
  ...collectHandlers,
];
