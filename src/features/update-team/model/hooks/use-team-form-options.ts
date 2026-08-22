import { useMembers } from "@entities/member";
import { useEquipments, type Equipment } from "@entities/equipment";
import type { SelectOption } from "@shared/ui/form";

const toEquipmentOptions = (list: Equipment[]): SelectOption[] =>
  list.map((e) => ({
    value: e.id,
    label: e.equipmentName ? `${e.managementNumber} · ${e.alias}` : e.managementNumber,
  }));

// 팀 폼에서 선택하는 사수/부사수(member)와 장비 4종(equipment) 옵션을 조립한다.
export const useTeamFormOptions = () => {
  const { data: members } = useMembers();
  const { data: particleSamplers } = useEquipments('PARTICLE_SAMPLER');
  const { data: gasSamplers } = useEquipments('GAS_SAMPLER');
  const { data: pitotTubes } = useEquipments('PITOT_TUBE');
  const { data: nozzles } = useEquipments('NOZZLE');

  const memberOptions: SelectOption[] = members.map((m) => ({
    value: String(m.id),
    label: m.department ? `${m.name} (${m.department})` : m.name,
  }));

  return {
    memberOptions,
    particleSamplerOptions: toEquipmentOptions(particleSamplers),
    gasSamplerOptions: toEquipmentOptions(gasSamplers),
    pitotTubeOptions: toEquipmentOptions(pitotTubes),
    nozzleOptions: toEquipmentOptions(nozzles),
  };
};
