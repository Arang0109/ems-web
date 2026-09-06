import { useMemo, useState } from "react";

import { useChangeEquipmentsAction } from "@entities/schedule";
import type { TeamSnapshot } from "@entities/schedule";
import { useEquipments } from "@entities/equipment";
import type { Equipment } from "@entities/equipment";

import type { EquipType } from "@shared/model";
import { toast } from "@shared/ui/toasts";

import type { ScheduleEquipmentsUpdateForm } from "../types";
import { MANAGED_EQUIP_TYPES } from "../types";
import { toScheduleEquipmentsUpdate } from "../mapper";

interface Props {
  scheduleId: number;
  team: TeamSnapshot;
  onSuccess: () => void;
}

const toOptions = (equipments: Equipment[]) =>
  equipments.map((equipment) => ({
    value: equipment.id,
    label: `${equipment.managementNumber} · ${equipment.alias || equipment.equipmentName}`,
  }));

export const useUpdateScheduleEquipments = ({ scheduleId, team, onSuccess }: Props) => {
  const { changeEquipments, isLoading } = useChangeEquipmentsAction();

  const particleSamplers = useEquipments("PARTICLE_SAMPLER");
  const gasSamplers = useEquipments("GAS_SAMPLER");
  const pitotTubes = useEquipments("PITOT_TUBE");
  const nozzles = useEquipments("NOZZLE");

  // 배정의 진실은 팀 스냅샷의 장비 목록이다 — 서버가 유형별 슬롯을 두지 않고 목록 하나로
  // 관리하므로, 화면의 슬롯 넷은 유형으로 골라 채운다.
  // 부모가 key로 리마운트하므로 prop은 초기값으로만 쓴다.
  const equipments = team.equipments ?? [];
  const idOf = (type: EquipType) =>
    equipments.find((equipment) => equipment.type === type)?.equipmentId ?? "";

  const [form, setForm] = useState<ScheduleEquipmentsUpdateForm>(() => ({
    particleSamplerId: idOf("PARTICLE_SAMPLER"),
    gasSamplerId: idOf("GAS_SAMPLER"),
    pitotTubeId: idOf("PITOT_TUBE"),
    nozzleId: idOf("NOZZLE"),
  }));

  // 화면에 슬롯이 없는 유형(가스분석기·기타)의 배정. 저장이 전체 교체라 그대로 되돌려 보낸다.
  const keepIds = equipments
    .filter((equipment) => !MANAGED_EQUIP_TYPES.includes(equipment.type))
    .map((equipment) => equipment.equipmentId);

  const options = useMemo(() => ({
    particleSampler: toOptions(particleSamplers.data),
    gasSampler: toOptions(gasSamplers.data),
    pitotTube: toOptions(pitotTubes.data),
    nozzle: toOptions(nozzles.data),
  }), [particleSamplers.data, gasSamplers.data, pitotTubes.data, nozzles.data]);

  const isOptionsLoading =
    particleSamplers.isLoading || gasSamplers.isLoading || pitotTubes.isLoading || nozzles.isLoading;

  const handleChange = (name: keyof ScheduleEquipmentsUpdateForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await changeEquipments(scheduleId, toScheduleEquipmentsUpdate(form, keepIds));
      toast.success("측정장비가 변경되었습니다.");
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "장비 변경에 실패했습니다.";
      toast.error(message);
    }
  };

  return { form, options, isOptionsLoading, isLoading, handleChange, handleSubmit };
};
