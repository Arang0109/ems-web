import type { CellContext } from '@tanstack/react-table';

import type { PollutantCatalogTableRow } from '../model/types';

import { StatusDot } from '@shared/ui/badges';

/** 폐지 여부 — 색상만으로 구분하지 않도록 점과 텍스트를 함께 보여준다. */
export const StatusCell = ({ row }: CellContext<PollutantCatalogTableRow, unknown>) => (
  <StatusDot tone={row.original.statusTone} label={row.original.statusLabel} />
);

/** 코드는 물질을 특정하는 키라 본문 글씨보다 눈에 띄게 고정폭으로 둔다. */
export const CodeCell = ({ getValue }: CellContext<PollutantCatalogTableRow, string>) => (
  <span className="font-mono text-body-4 text-foreground">{getValue()}</span>
);
