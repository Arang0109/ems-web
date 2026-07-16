import { PageTitle } from "@shared/ui/semantics";
import { Tabs } from "@shared/ui/tabs";
import { EQUIP_TYPE } from "@shared/model";
import { EQUIP_TYPE_LABEL } from "@shared/config";

import { EquipmentTable } from "@widgets/equipment-table";

import { useEquipmentSelection } from "./model/use-equipment-selection";

export const EquipmentPage = () => {
  const { selectedEquipment, handleSelectEquipmentRow } = useEquipmentSelection();

  const tabOptions = EQUIP_TYPE.map((type) => ({
    value: type,
    label: EQUIP_TYPE_LABEL[type],
    content: (
      <EquipmentTable
        type={type}
        selectedEquipment={selectedEquipment}
        onRowClick={handleSelectEquipmentRow}
      />
    ),
  }));

  return (
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="측정장비 관리" description="종류별 측정장비를 등록·수정·삭제하고 상태를 관리할 수 있습니다." />

      <Tabs options={tabOptions} gap={2} />
    </div>
  );
};
