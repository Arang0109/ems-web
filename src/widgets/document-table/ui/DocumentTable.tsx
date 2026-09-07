import type { DocumentCategory } from '@shared/model';
import { useRemountKey } from '@shared/model';
import { DOCUMENT_CATEGORY_LABEL } from '@shared/config';

import { RegisterDocumentForm } from '@features/register-document';

import { BasicTable, TableFooterBar } from '@shared/ui/table';
import { Search } from '@shared/ui/form';

import { useDocumentTable } from '../model/use-document-table';
import { DocumentDetailDialog } from './DocumentDetailDialog';

interface Props {
  category: DocumentCategory;
}

// Tabs가 이미 카드 컨테이너를 그리므로 TablePanel(자체 카드)을 쓰지 않는다.
export const DocumentTable = ({ category }: Props) => {
  const {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    detailModalOpen, setDetailModalOpen,
    detailDocument, detailDocumentId,

    globalFilter, setGlobalFilter,

    isLoading, error,
  } = useDocumentTable({ category });

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerModalOpen);
  const detailFormKey = useRemountKey(detailModalOpen);

  return (
    <div>
      <div className="pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-h3 text-foreground">{DOCUMENT_CATEGORY_LABEL[category]} 목록</h2>
          </div>
          <RegisterDocumentForm
            key={registerFormKey}
            open={registerModalOpen}
            onOpenChange={setRegisterModalOpen}
            defaultCategory={category}
          />
        </div>
      </div>

      <div className="flex items-center justify-start mt-3">
        <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'문서명, 설명 검색 ...'} />
      </div>

      <div className="py-5 flex-1 flex flex-col">
        <BasicTable
          table={table}
          loading={isLoading}
          error={error}
          onRowClick={handleRowClick}
          isRowSelected={(row) => row.id === detailDocumentId}
        />
      </div>

      {!isLoading && !error && (
        <TableFooterBar table={table} className="border-t border-border pt-3" />
      )}

      <DocumentDetailDialog
        key={detailFormKey}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        document={detailDocument}
      />
    </div>
  );
};
