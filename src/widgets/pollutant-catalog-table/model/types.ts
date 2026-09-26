import type { StatusTone } from '@shared/ui/badges';

export type PollutantCatalogTableRow = {
  id: number;
  code: string;
  field: string;
  nameKr: string;
  /** 측정방식 라벨. 미분류면 '—' */
  mode: string;
  /** 미지정이면 '—' */
  sortOrder: string;
  statusLabel: string;
  statusTone: StatusTone;
}
