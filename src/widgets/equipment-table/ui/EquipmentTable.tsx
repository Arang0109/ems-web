import { useEquipmentTable } from '../model/use-equipment-table';

import { RegisterEquipmentForm } from '@features/register-equipment';
import { UpdateEquipmentForm } from '@features/update-equipment';

import { BasicTable } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { Pagination } from '@shared/ui/pagination';
import { EQUIP_TYPE_LABEL } from '@shared/config';
import type { EquipType } from '@shared/model';
import type { Equipment } from '@entities/equipment';

interface Props {
  type: EquipType;
  selectedEquipment: Equipment | null;
  onRowClick: (equipmentId: string) => void;
  onSuccess?: () => void;
}

export const EquipmentTable = ({ type, selectedEquipment, onRowClick, onSuccess }: Props) => {
  const {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,

    globalFilter, setGlobalFilter,

    loading, error, refetch,
  } = useEquipmentTable({ type, onRowClick, onSuccess });

  return (
    <div>
      <div className="pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">{EQUIP_TYPE_LABEL[type]} 목록</h2>
          </div>
          <RegisterEquipmentForm
            open={registerModalOpen}
            onOpenChange={setRegisterModalOpen}
            defaultType={type}
            onSuccess={refetch}
          />
        </div>
      </div>

      <div className="flex items-center justify-start mt-3">
        <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'관리번호, 장비명 검색 ...'} />
      </div>

      <div className="py-5 flex-1 flex flex-col">
        <BasicTable table={table} error={error} onRowClick={handleRowClick} />
      </div>

      {!loading && !error && (
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground leading-none">
            총 <span className="font-medium text-muted-foreground">{table.getFilteredRowModel().rows.length}</span>건
          </span>
          <Pagination
            pageIndex={table.getState().pagination.pageIndex}
            pageCount={table.getPageCount()}
            canPreviousPage={table.getCanPreviousPage()}
            canNextPage={table.getCanNextPage()}
            onPreviousPage={() => table.previousPage()}
            onNextPage={() => table.nextPage()}
            onPageChange={(idx) => table.setPageIndex(idx)}
          />
        </div>
      )}

      <UpdateEquipmentForm
        key={selectedEquipment?.id}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        equipment={selectedEquipment}
        onSuccess={refetch}
      />
    </div>
  );
};
