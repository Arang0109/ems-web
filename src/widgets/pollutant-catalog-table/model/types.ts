import type { StatusTone } from '@shared/ui/badges';

export type PollutantCatalogTableRow = {
  id: number;
  code: string;
  field: string;
  nameKr: string;
  method: string;
  /** 미지정이면 '—' */
  sortOrder: string;
  statusLabel: string;
  statusTone: StatusTone;
}
