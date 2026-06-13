import { useRegisterSubstance } from '../model/hooks/use-register-substance';

import { FormDialog } from '@shared/ui/dialogs';
import { FieldGroup, InputGroup, SectionTitle } from '@shared/ui/form';
import { FlaskConical } from 'lucide-react';

interface Props {
  preventionId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegisterSubstanceForm = ({ preventionId, open, onOpenChange, onSuccess }: Props) => {
  const { form, isLoading, handleChange, handleSubmit } = useRegisterSubstance({
    preventionId,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      triggerLabel="대상물질 추가"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="등록"
      isLoading={isLoading}
    >
      <FieldGroup>
        <SectionTitle>대상물질 정보</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="name"
            label="물질명"
            placeholder="예: NOx, SOx"
            value={form.name}
            onChange={value => handleChange('name', value)}
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
