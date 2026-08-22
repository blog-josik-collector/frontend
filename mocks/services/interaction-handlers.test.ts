import { expect, it } from 'vitest';

import { commentHandlers } from './comment';
import { reportHandlers } from './report';

it('registers interaction mocks at the same service prefix used by the client', () => {
  const paths = [...commentHandlers, ...reportHandlers].map((handler) => handler.info.path);

  expect(paths.every((path) => String(path).startsWith('/interaction/v1/'))).toBe(true);
});
