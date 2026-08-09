import { useEquipmentTable } from '../model/use-equipment-table';

import { RegisterEquipmentForm } from '@features/register-equipment';
import { UpdateEquipmentForm } from '@features/update-equipment';
import { InspectionHistoryDialog } from '@features/record-inspection';

import { BasicTable, TableFooterBar } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { EQUIP_TYPE_LABEL } from '@shared/config';
import type { EquipType } from '@shared/model';
import type { Equipment } from '@entities/equipment';
import { Panel } from '@shared/ui/cards';

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

    inspectionModalOpen, setInspectionModalOpen,
    inspectionType, handleOpenInspectionHistory,

    globalFilter, setGlobalFilter,

    loading, error, refetch,
  } = useEquipmentTable({ type, onRowClick, onSuccess });

  return (
    <Panel className="p-0 flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-panel p-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-h3 text-foreground">{EQUIP_TYPE_LABEL[type]} 목록</h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'관리번호, 장비명 검색 ...'} />
          <RegisterEquipmentForm
            open={registerModalOpen}
            onOpenChange={setRegisterModalOpen}
            defaultType={type}
            onSuccess={refetch}
          />
        </div>
      </header>

      <div className="bg-panel">
        <BasicTable table={table} error={error} onRowClick={handleRowClick} />
      </div>

      {!loading && !error && (
        <TableFooterBar table={table} className="bg-panel py-1" />
      )}

      {/* key에 modifiedAt을 포함해 검사 이력 등록 등으로 장비가 갱신되면 폼이 새 값으로 리마운트되게 한다. */}
      <UpdateEquipmentForm
        key={selectedEquipment ? `${selectedEquipment.id}-${selectedEquipment.modifiedAt}` : undefined}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        equipment={selectedEquipment}
        onSuccess={refetch}
        onOpenInspectionHistory={handleOpenInspectionHistory}
      />

      {inspectionType && (
        <InspectionHistoryDialog
          key={`${selectedEquipment?.id}-${inspectionType}`}
          open={inspectionModalOpen}
          onOpenChange={setInspectionModalOpen}
          equipmentId={selectedEquipment?.id ?? null}
          equipmentName={selectedEquipment?.equipmentName ?? ''}
          type={inspectionType}
          onSuccess={refetch}
        />
      )}
    </Panel>
  );
};
