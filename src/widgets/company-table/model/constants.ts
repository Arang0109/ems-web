import type { ContractStatus } from "@entities/company";
import { type VariantProps } from "class-variance-authority";

import { badgeVariants } from "@/components/variants/badgeVariants";

export const STATUS_MAP: Record<ContractStatus, { label: string; variant: VariantProps<typeof badgeVariants>["variant"], }> = {
  active:   { label: '계약중', variant: 'contract' },
  expiringSoon: { label: '만료예정', variant: 'destructive'},
  expired: { label: '만료', variant: 'default' },
};