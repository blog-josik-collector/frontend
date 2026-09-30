import { describe, expect, it } from 'vitest';

import { getProviderBadgeColor } from './provider-colors';

describe('getProviderBadgeColor', () => {
  it.each([null, undefined, ''])('uses a neutral color for %j', (provider) => {
    expect(getProviderBadgeColor(provider)).toBe('bg-muted text-muted-foreground');
  });
});
