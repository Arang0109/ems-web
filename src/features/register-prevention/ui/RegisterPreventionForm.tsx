import { useRegisterPrevention } from '../model/hooks/use-register-prevention';

import { FormDialog } from '@shared/ui/dialogs';
import { FieldGroup, InputGroup, SectionTitle } from '@shared/ui/form';
import { Shield, FlaskConical } from 'lucide-react';

interface Props {
  stackId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegisterPreventionForm = ({ stackId, open, onOpenChange, onSuccess }: Props) => {
  const { form, handleChange, handleSubmit } = useRegisterPrevention({
    stackId,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="등록"
    >
      <FieldGroup>
        <SectionTitle>방지시설 정보</SectionTitle>
        <InputGroup
          id="name"
          label="방지시설명"
          placeholder="방지시설명"
          value={form.name}
          onChange={value => handleChange('name', value)}
          startIcon={<Shield />}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="capacity"
            label="용량"
            placeholder="예: 500"
            value={form.capacity}
            onChange={value => handleChange('capacity', value)}
          />
          <InputGroup
            id="unit"
            label="단위"
            placeholder="예: m³/min"
            value={form.unit}
            onChange={value => handleChange('unit', value)}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="targetName"
            label="대상물질명"
            placeholder="예: NOx, SOx"
            value={form.targetName}
            onChange={value => handleChange('targetName', value)}
            startIcon={<FlaskConical />}
          />
          <InputGroup
            id="removalEfficiency"
            label="제거 효율"
            placeholder="예: 95%"
            value={form.removalEfficiency}
            onChange={value => handleChange('removalEfficiency', value)}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
