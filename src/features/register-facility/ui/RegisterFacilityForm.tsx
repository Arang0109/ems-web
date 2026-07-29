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
  const { form, handleChange, handleSubmit } = useRegisterFacility({
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
            id="productOutput"
            label="제품 생산량"
            placeholder="예: 1000"
            value={form.productOutput}
            onChange={value => handleChange('productOutput', value)}
          />
          <InputGroup
            id="fuelUsage"
            label="연료 사용량"
            placeholder="예: 100L"
            value={form.fuelUsage}
            onChange={value => handleChange('fuelUsage', value)}
          />
          <InputGroup
            id="incinerationAmount"
            label="소각량"
            placeholder="예: 200"
            value={form.incinerationAmount}
            onChange={value => handleChange('incinerationAmount', value)}
          />
          <InputGroup
            id="fuelInput"
            label="원료 투입량"
            placeholder="예: 50L"
            value={form.fuelInput}
            onChange={value => handleChange('fuelInput', value)}
          />
          <InputGroup
            id="fuelType"
            label="종류"
            placeholder="예: 경유, LNG"
            value={form.fuelType}
            onChange={value => handleChange('fuelType', value)}
          />
          <InputGroup
            id="unit"
            label="단위"
            placeholder="예: kg/h"
            value={form.unit}
            onChange={value => handleChange('unit', value)}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
