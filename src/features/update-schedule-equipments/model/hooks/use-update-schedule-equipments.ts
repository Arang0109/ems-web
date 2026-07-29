import { useMemo, useState } from "react";

import { useChangeEquipmentsAction } from "@entities/schedule";
import type { TeamSnapshot } from "@entities/schedule";
import { useEquipments } from "@entities/equipment";
import type { Equipment } from "@entities/equipment";

import { toast } from "@shared/ui/toasts";

import type { ScheduleEquipmentsUpdateForm } from "../types";
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

  // 배정의 진실은 team의 id 4종이다. equipments 배열은 원장에서 장비가 삭제되면
  // 항목이 빠질 수 있어 역산 근거로 쓰지 않는다.
  // 부모가 key로 리마운트하므로 prop은 초기값으로만 쓴다.
  const [form, setForm] = useState<ScheduleEquipmentsUpdateForm>({
    particleSamplerId: team.particleSamplerId ?? "",
    gasSamplerId: team.gasSamplerId ?? "",
    pitotTubeId: team.pitotTubeId ?? "",
    nozzleId: team.nozzleId ?? "",
  });

  const options = useMemo(() => ({
    particleSampler: toOptions(particleSamplers.data),
    gasSampler: toOptions(gasSamplers.data),
    pitotTube: toOptions(pitotTubes.data),
    nozzle: toOptions(nozzles.data),
  }), [particleSamplers.data, gasSamplers.data, pitotTubes.data, nozzles.data]);

  const isOptionsLoading =
    particleSamplers.loading || gasSamplers.loading || pitotTubes.loading || nozzles.loading;

  const handleChange = (name: keyof ScheduleEquipmentsUpdateForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await changeEquipments(scheduleId, toScheduleEquipmentsUpdate(form));
      toast.success("측정장비가 변경되었습니다.");
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "장비 변경에 실패했습니다.";
      toast.error(message);
    }
  };

  return { form, options, isOptionsLoading, isLoading, handleChange, handleSubmit };
};
