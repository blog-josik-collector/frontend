import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
  {
    variants: {
      tone: {
        default: 'bg-primary/10 text-primary',
        muted: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: { tone: 'muted' },
  },
);

function StatusBadge({
  tone,
  className,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof statusBadgeVariants>) {
  return <span className={cn(statusBadgeVariants({ tone }), className)} {...props} />;
}

export { StatusBadge, statusBadgeVariants };
