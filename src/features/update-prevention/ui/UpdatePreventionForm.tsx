import { useUpdatePrevention } from '../model/hooks/use-update-prevention';
import { useDeletePrevention } from '../model/hooks/use-delete-prevention';

import type { Prevention } from '@entities/stack';
import { FormDialog } from '@shared/ui/dialogs';
import { FieldGroup, InputGroup, SectionTitle } from '@shared/ui/form';
import { Shield, FlaskConical } from 'lucide-react';

interface Props {
  prevention: Prevention | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const UpdatePreventionForm = ({ prevention, open, onOpenChange, onSuccess }: Props) => {
  const close = () => onOpenChange(false);

  const { form, isLoading: isUpdating, handleChange, handleSubmit } = useUpdatePrevention({
    prevention,
    onSuccess: () => { close(); onSuccess?.(); },
  });

  const { isLoading: isDeleting, handleDelete } = useDeletePrevention({
    prevention,
    onSuccess: () => { close(); onSuccess?.(); },
  });

  return (
    <FormDialog
      title="방지시설 상세"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      submitLabel="수정"
      deleteLabel="삭제"
      cancelLabel="닫기"
      isLoading={isUpdating || isDeleting}
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
        <InputGroup
          id="capacity"
          label="용량"
          placeholder="예: 500"
          value={form.capacity}
          onChange={value => handleChange('capacity', value)}
        />
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
