import type { Table } from "@tanstack/react-table";
import { FileClock, Upload } from "lucide-react";

import { Button } from "@shared/ui/buttons";
import { SectionTitle } from "@shared/ui/form";
import { BasicTable, TableEmptyState, TableFooterBar } from "@shared/ui/table";

import type { DocumentVersionTableRow } from "../model/types";

interface Props {
  table: Table<DocumentVersionTableRow>;
  loading?: boolean;
  error?: string | null;
  onUploadClick: () => void;
}

export const DocumentVersionSection = ({ table, loading, error, onUploadClick }: Props) => (
  <div className="mt-5">
    <div className="flex items-center justify-between gap-3">
      <SectionTitle>버전 이력</SectionTitle>
      <Button type="button" variant="outline" onClick={onUploadClick} startIcon={Upload}>
        새 버전 업로드
      </Button>
    </div>

    <div className="py-4">
      <BasicTable
        table={table}
        loading={loading}
        error={error}
        emptyState={
          <TableEmptyState
            icon={<FileClock className="text-muted-ink" size={20} />}
            label="등록된 버전이 없습니다."
            subLabel="새 버전을 업로드해 주세요."
          />
        }
      />
    </div>

    {!loading && !error && <TableFooterBar table={table} />}
  </div>
);
