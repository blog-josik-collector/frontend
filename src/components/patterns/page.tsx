import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const pageContentVariants = cva('w-full', {
  variants: {
    variant: {
      list: 'flex flex-col gap-4',
      detail: 'mx-auto max-w-4xl space-y-6 py-2',
      form: 'mx-auto flex max-w-2xl flex-col gap-6 py-4',
      grid: 'flex flex-col gap-6 py-2',
    },
  },
  defaultVariants: { variant: 'list' },
});

const pageTitleVariants = cva('', {
  variants: {
    level: {
      default: 'text-xl font-semibold',
      management: 'text-2xl font-bold',
    },
  },
  defaultVariants: { level: 'default' },
});

function PageContent({
  variant,
  className,
  ...props
}: React.ComponentProps<'main'> & VariantProps<typeof pageContentVariants>) {
  return <main className={cn(pageContentVariants({ variant, className }))} {...props} />;
}

function PageHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header
      className={cn('flex flex-wrap items-end justify-between gap-4', className)}
      {...props}
    />
  );
}

function PageTitle({
  level,
  className,
  ...props
}: React.ComponentProps<'h1'> & VariantProps<typeof pageTitleVariants>) {
  return <h1 className={cn(pageTitleVariants({ level, className }))} {...props} />;
}

function PageDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p className={cn('mt-1 text-sm text-muted-foreground', className)} {...props} />
  );
}

export {
  PageContent,
  pageContentVariants,
  PageDescription,
  PageHeader,
  PageTitle,
};
