import { useRegisterTeam } from "../model/hooks/use-register-team";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { InputGroup, SectionTitle, FieldGroup, Select } from "@shared/ui/form";
import { Plus, Users } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegisterTeamForm = ({ open, onOpenChange, onSuccess }: Props) => {
  const {
    form,
    fieldErrors,
    memberOptions,
    particleSamplerOptions,
    gasSamplerOptions,
    pitotTubeOptions,
    nozzleOptions,
    handleChange,
    handleSubmit,
  } = useRegisterTeam({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      triggerLabel={<><Plus />등록</>}
      size="lg"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="등록"
    >
      <FieldGroup>
        <SectionTitle>팀 정보</SectionTitle>
        <InputGroup
          id="name"
          label="팀 이름"
          placeholder="팀 이름"
          value={form.name}
          onChange={(v) => handleChange('name', v)}
          invalid={!!fieldErrors?.name}
          error={fieldErrors?.name}
          required
          startIcon={<Users />}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <Select
            id="mentorUserId"
            label="사수"
            placeholder="사수 선택"
            options={memberOptions}
            value={form.mentorUserId}
            onValueChange={(v) => handleChange('mentorUserId', v ?? '')}
            required
          />
          <Select
            id="menteeUserId"
            label="부사수"
            placeholder="부사수 선택"
            options={memberOptions}
            value={form.menteeUserId}
            onValueChange={(v) => handleChange('menteeUserId', v ?? '')}
            required
          />
        </div>

        <Divider />

        <SectionTitle>배정 장비</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <Select
            id="particleSamplerId"
            label="입자샘플러"
            placeholder="입자샘플러 선택"
            options={particleSamplerOptions}
            value={form.particleSamplerId}
            onValueChange={(v) => handleChange('particleSamplerId', v ?? '')}
            required
          />
          <Select
            id="gasSamplerId"
            label="가스샘플러"
            placeholder="가스샘플러 선택"
            options={gasSamplerOptions}
            value={form.gasSamplerId}
            onValueChange={(v) => handleChange('gasSamplerId', v ?? '')}
            required
          />
          <Select
            id="pitotTubeId"
            label="피토관"
            placeholder="피토관 선택"
            options={pitotTubeOptions}
            value={form.pitotTubeId}
            onValueChange={(v) => handleChange('pitotTubeId', v ?? '')}
            required
          />
          <Select
            id="nozzleId"
            label="노즐"
            placeholder="노즐 선택"
            options={nozzleOptions}
            value={form.nozzleId}
            onValueChange={(v) => handleChange('nozzleId', v ?? '')}
            required
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
