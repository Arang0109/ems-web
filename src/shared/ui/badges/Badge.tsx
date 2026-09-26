import type { VariantProps } from 'class-variance-authority';

import { badgeVariants } from './badge-variants';
import { cn } from '@/lib/utils';

type Props = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export const Badge = ({ className, tone, size, ...props }: Props) => (
  <span data-slot="badge" className={cn(badgeVariants({ tone, size }), className)} {...props} />
);
