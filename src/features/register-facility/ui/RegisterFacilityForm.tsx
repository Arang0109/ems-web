import { useRegisterFacility } from '../model/hooks/use-register-facility';

import { FormDialog } from '@shared/ui/dialogs';
import { FieldGroup, InputGroup, SectionTitle } from '@shared/ui/form';
import { Factory } from 'lucide-react';

interface Props {
  stackId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegisterFacilityForm = ({ stackId, open, onOpenChange, onSuccess }: Props) => {
  const { form, isLoading, handleChange, handleSubmit } = useRegisterFacility({
    stackId,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      triggerLabel="배출시설 추가"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="등록"
      isLoading={isLoading}
    >
      <FieldGroup>
        <SectionTitle>배출시설 정보</SectionTitle>
        <InputGroup
          id="name"
          label="배출시설명"
          placeholder="배출시설명"
          value={form.name}
          onChange={value => handleChange('name', value)}
          startIcon={<Factory />}
        />
        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup
            id="fuelType"
            label="연료 유형"
            placeholder="예: 경유, LNG"
            value={form.fuelType}
            onChange={value => handleChange('fuelType', value)}
          />
          <InputGroup
            id="fuelUsage"
            label="연료 사용량"
            placeholder="예: 100L"
            value={form.fuelUsage}
            onChange={value => handleChange('fuelUsage', value)}
          />
          <InputGroup
            id="fuelInput"
            label="연료 투입량"
            placeholder="예: 50L"
            value={form.fuelInput}
            onChange={value => handleChange('fuelInput', value)}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
