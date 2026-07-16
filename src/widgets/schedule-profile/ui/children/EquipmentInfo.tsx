import type { EquipmentSnapshot } from "@entities/schedule";
import { EQUIP_TYPE_LABEL } from "@shared/config";

import { value, describeEquipmentSpec } from "../../model/mapper";

interface Props {
  equipments: EquipmentSnapshot[];
}

const SpecItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-muted/40 rounded-xl px-4 py-3">
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground break-all">{value}</p>
  </div>
);

export const EquipmentInfo = ({ equipments }: Props) => {
  if (equipments.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">등록된 측정장비가 없습니다.</p>;
  }

  return (
    <div className="space-y-5">
      {equipments.map((equip) => (
        <div key={equip.equipmentId} className="rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {EQUIP_TYPE_LABEL[equip.type] ?? equip.type}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {value(equip.equipmentName || equip.modelName)}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SpecItem label="관리번호" value={value(equip.managementNumber)} />
            <SpecItem label="시리얼번호" value={value(equip.serialNumber)} />
            <SpecItem label="모델명" value={value(equip.modelName)} />
            <SpecItem label="제조사" value={value(equip.manufacturer)} />
            {describeEquipmentSpec(equip).map((spec) => (
              <SpecItem key={spec.label} label={spec.label} value={spec.value} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
