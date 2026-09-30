import { describe, expect, it } from 'vitest';

import { capitalizeFirst } from './string';

describe('capitalizeFirst', () => {
  it.each([
    [null, ''],
    [undefined, ''],
    ['', ''],
    ['a', 'A'],
    ['A', 'A'],
    ['pROVIDER', 'Provider'],
    ['PROVIDER NAME', 'Provider name'],
    ['테크 뉴스', '테크 뉴스'],
    ['1PROVIDER', '1provider'],
    ['𐐨ABC', '𐐀abc'],
  ])('formats %j as %j', (value, expected) => {
    expect(capitalizeFirst(value)).toBe(expected);
  });
});
