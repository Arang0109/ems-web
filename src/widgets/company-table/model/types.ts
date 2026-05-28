import type { ActiveStatus } from "@shared/model";

export const STATUS_MAP: Record<ActiveStatus, { label: string; className: string }> = {
  active:   { label: '활성', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  inactive: { label: '비활성', className: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
};