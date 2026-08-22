import { PageLayout } from "@shared/ui/layout";
import { Tabs } from "@shared/ui/tabs";
import { EQUIP_TYPE } from "@shared/model";
import { EQUIP_TYPE_LABEL } from "@shared/config";

import { EquipmentTable } from "@widgets/equipment-table";

export const EquipmentPage = () => {
  const tabOptions = EQUIP_TYPE.map((type) => ({
    value: type,
    label: EQUIP_TYPE_LABEL[type],
    content: <EquipmentTable type={type} />,
  }));

  return (
    <PageLayout
      title="측정장비 관리"
      description="종류별 측정장비를 등록·수정·삭제하고 상태를 관리할 수 있습니다."
    >
      <Tabs options={tabOptions} />
    </PageLayout>
  );
};
