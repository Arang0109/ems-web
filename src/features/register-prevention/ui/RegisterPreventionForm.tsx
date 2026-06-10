import { useRegisterPrevention } from '../model/hooks/use-register-prevention';

import { FormDialog } from '@shared/ui/dialogs';
import { FieldGroup, InputGroup, SectionTitle } from '@shared/ui/form';
import { Shield } from 'lucide-react';

interface Props {
  stackId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegisterPreventionForm = ({ stackId, open, onOpenChange, onSuccess }: Props) => {
  const { form, isLoading, handleChange, handleSubmit } = useRegisterPrevention({
    stackId,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      triggerLabel="방지시설 추가"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="등록"
      isLoading={isLoading}
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
      </FieldGroup>
    </FormDialog>
  );
};
