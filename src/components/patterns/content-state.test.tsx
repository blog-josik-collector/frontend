import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { Table, TableBody } from '@/components/ui/table';

import { ContentState, TableContentState } from './content-state';

describe('ContentState', () => {
  it('announces error titles as alerts', () => {
    render(<ContentState kind="error" title="불러오지 못했습니다." />);

    expect(screen.getByRole('alert')).toHaveTextContent('불러오지 못했습니다.');
  });

  it('announces empty states with a status role', () => {
    render(<ContentState kind="empty" title="표시할 항목이 없습니다." />);

    expect(screen.getByRole('status')).toHaveTextContent('표시할 항목이 없습니다.');
  });
});

describe('TableContentState', () => {
  it('forwards its column span to the table cell', () => {
    render(
      <Table>
        <TableBody>
          <TableContentState colSpan={7} kind="empty" title="표시할 항목이 없습니다." />
        </TableBody>
      </Table>,
    );

    expect(screen.getByRole('cell')).toHaveAttribute('colspan', '7');
  });
});
