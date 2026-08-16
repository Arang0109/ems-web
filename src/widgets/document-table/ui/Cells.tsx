import type { CellContext } from "@tanstack/react-table";
import { Download } from "lucide-react";

import { Button } from "@shared/ui/buttons";

import type { DocumentTableRow, DocumentVersionTableRow } from "../model/types";

export const CustomCell = ({ getValue }: CellContext<DocumentTableRow, string>) => (
  <span className="text-body-4 text-foreground">{getValue()}</span>
);

export const VersionCustomCell = ({ getValue }: CellContext<DocumentVersionTableRow, string>) => (
  <span className="text-body-4 text-foreground">{getValue()}</span>
);

/** 최신본 다운로드. 파일이 없는 문서(latestVersionNo === 0)는 비활성한다. */
export const DownloadCell = ({ row, table }: CellContext<DocumentTableRow, unknown>) => (
  <Button
    type="button"
    variant="outline"
    disabled={row.original.latestVersionNo < 1}
    onClick={() => table.options.meta?.onDownload?.(row.original)}
    startIcon={Download}
  >
    다운로드
  </Button>
);

export const VersionDownloadCell = ({ row, table }: CellContext<DocumentVersionTableRow, unknown>) => (
  <Button
    type="button"
    variant="outline"
    onClick={() => table.options.meta?.onDownload?.(row.original)}
    startIcon={Download}
  >
    다운로드
  </Button>
);
