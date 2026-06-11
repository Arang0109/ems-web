import { useUpdatePrevention } from '../model/hooks/use-update-prevention';
import { useDeletePrevention } from '../model/hooks/use-delete-prevention';

import type { Prevention } from '@entities/stack';
import { FormDialog } from '@shared/ui/dialogs';
import { FieldGroup, InputGroup, SectionTitle } from '@shared/ui/form';
import { Shield } from 'lucide-react';

interface Props {
  stackId: number;
  prevention: Prevention | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const UpdatePreventionForm = ({ stackId, prevention, open, onOpenChange, onSuccess }: Props) => {
  const close = () => onOpenChange(false);

  const { form, isLoading: isUpdating, handleChange, handleSubmit } = useUpdatePrevention({
    stackId,
    prevention,
    onSuccess: () => { close(); onSuccess?.(); },
  });

  const { isLoading: isDeleting, handleDelete } = useDeletePrevention({
    stackId,
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
      </FieldGroup>
    </FormDialog>
  );
};
