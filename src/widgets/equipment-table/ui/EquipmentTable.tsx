import { useEquipmentTable } from '../model/use-equipment-table';

import { RegisterEquipmentForm } from '@features/register-equipment';
import { UpdateEquipmentForm } from '@features/update-equipment';
import { InspectionHistoryDialog } from '@features/record-inspection';

import { BasicTable, TableFooterBar } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { EQUIP_TYPE_LABEL } from '@shared/config';
import type { EquipType } from '@shared/model';
import { useRemountKey } from '@shared/model';
import { Panel } from '@shared/ui/cards';

interface Props {
  type: EquipType;
}

export const EquipmentTable = ({ type }: Props) => {
  const {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailEquipment,

    inspectionModalOpen, setInspectionModalOpen,
    inspectionType, handleOpenInspectionHistory,

    globalFilter, setGlobalFilter,

    isLoading, error,
  } = useEquipmentTable({ type });

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerModalOpen);
  const updateFormKey = useRemountKey(updateModalOpen);
  const inspectionFormKey = useRemountKey(inspectionModalOpen);

  return (
    <Panel className="p-0 flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-panel p-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-h3 text-foreground">{EQUIP_TYPE_LABEL[type]} 목록</h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'관리번호, 장비명 검색 ...'} />
          <RegisterEquipmentForm
            key={registerFormKey}
            open={registerModalOpen}
            onOpenChange={setRegisterModalOpen}
            defaultType={type}
          />
        </div>
      </header>

      <div className="bg-panel">
        <BasicTable table={table} error={error} onRowClick={handleRowClick} />
      </div>

      {!isLoading && !error && (
        <TableFooterBar table={table} className="bg-panel py-1" />
      )}

      {/* key에 modifiedAt을 포함해 검사 이력 등록 등으로 장비가 갱신되면(열린 채로) 폼이 새 값으로 리마운트되게 한다. */}
      <UpdateEquipmentForm
        key={`${updateFormKey}-${detailEquipment?.id}-${detailEquipment?.modifiedAt}`}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        equipment={detailEquipment}
        onOpenInspectionHistory={handleOpenInspectionHistory}
      />

      {inspectionType && (
        <InspectionHistoryDialog
          key={`${inspectionFormKey}-${detailEquipment?.id}-${inspectionType}`}
          open={inspectionModalOpen}
          onOpenChange={setInspectionModalOpen}
          equipmentId={detailEquipment?.id ?? null}
          equipmentName={detailEquipment?.equipmentName ?? ''}
          type={inspectionType}
        />
      )}
    </Panel>
  );
};
