import * as React from 'react';

import { cn } from '@/lib/utils';

import { TableCell, TableRow } from '@/components/ui/table';

type ContentStateKind = 'loading' | 'empty' | 'error' | 'not-found';

type ContentStateProps = React.ComponentProps<'div'> & {
  kind: ContentStateKind;
  title: string;
  description?: string;
  icon?: React.ReactNode;
};

function ContentState({
  kind,
  title,
  description,
  icon,
  className,
  ...props
}: ContentStateProps) {
  const isError = kind === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={cn('flex flex-col items-center gap-3 py-12 text-center', className)}
      {...props}
    >
      {icon ? (
        <div className={cn('text-muted-foreground', isError && 'text-destructive')}>
          {icon}
        </div>
      ) : null}
      <p className={cn('font-medium', isError && 'text-destructive')}>{title}</p>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

type TableContentStateProps = Omit<ContentStateProps, 'className'> & {
  colSpan: number;
};

function TableContentState({ colSpan, ...contentStateProps }: TableContentStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <ContentState {...contentStateProps} />
      </TableCell>
    </TableRow>
  );
}

export {
  ContentState,
  type ContentStateKind,
  type ContentStateProps,
  TableContentState,
  type TableContentStateProps,
};
