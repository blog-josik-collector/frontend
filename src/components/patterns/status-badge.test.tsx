import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('uses destructive semantic tokens for destructive statuses', () => {
    render(<StatusBadge tone="destructive">실패</StatusBadge>);

    expect(screen.getByText('실패')).toHaveClass('bg-destructive/10', 'text-destructive');
  });
});
