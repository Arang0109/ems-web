import type { TeamSnapshot } from "@entities/schedule";
import { EQUIP_TYPE_LABEL } from "@shared/config";
import { FormDialog } from "@shared/ui/dialogs";
import { FieldGroup, Select } from "@shared/ui/form";

import { useUpdateScheduleEquipments } from "../model/hooks/use-update-schedule-equipments";

interface Props {
  scheduleId: number;
  team: TeamSnapshot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const UpdateScheduleEquipmentsForm = ({
  scheduleId, team, open, onOpenChange, onSuccess,
}: Props) => {
  const { form, options, isOptionsLoading, isLoading, handleChange, handleSubmit } =
    useUpdateScheduleEquipments({
      scheduleId,
      team,
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });

  return (
    <FormDialog
      title="측정장비 변경"
      description="선택하지 않은 장비는 기존 배정이 그대로 유지됩니다."
      open={open}
      onOpenChange={onOpenChange}
      cancelLabel="취소"
      submitLabel="변경"
      isLoading={isLoading}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="grid md:grid-cols-2 gap-4">
          <Select
            id="particleSamplerId"
            searchable
            label={EQUIP_TYPE_LABEL.PARTICLE_SAMPLER}
            placeholder="장비 선택"
            options={options.particleSampler}
            value={form.particleSamplerId}
            disabled={isOptionsLoading}
            onValueChange={(value) => value && handleChange("particleSamplerId", value)}
          />
          <Select
            id="gasSamplerId"
            searchable
            label={EQUIP_TYPE_LABEL.GAS_SAMPLER}
            placeholder="장비 선택"
            options={options.gasSampler}
            value={form.gasSamplerId}
            disabled={isOptionsLoading}
            onValueChange={(value) => value && handleChange("gasSamplerId", value)}
          />
          <Select
            id="pitotTubeId"
            searchable
            label={EQUIP_TYPE_LABEL.PITOT_TUBE}
            placeholder="장비 선택"
            options={options.pitotTube}
            value={form.pitotTubeId}
            disabled={isOptionsLoading}
            onValueChange={(value) => value && handleChange("pitotTubeId", value)}
          />
          <Select
            id="nozzleId"
            searchable
            label={EQUIP_TYPE_LABEL.NOZZLE}
            placeholder="장비 선택"
            options={options.nozzle}
            value={form.nozzleId}
            disabled={isOptionsLoading}
            onValueChange={(value) => value && handleChange("nozzleId", value)}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
