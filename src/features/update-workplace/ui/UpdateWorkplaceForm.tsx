import { useUpdateWorkplace } from '../model/hooks/use-update-workplace';
import { useDeleteWorkplace } from '../model/hooks/use-delete-workplace';

import type { WorkplaceListItem } from '@entities/workplace';

import { FormDialog } from "@shared/ui/dialogs";
import { FieldGroup, InputGroup, SectionTitle } from "@shared/ui/form";

import { Building2, Hash, MapPin } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workplace: WorkplaceListItem | null;
  onSuccess?: () => void;
}

export const UpdateWorkplaceForm = ({ open, onOpenChange, workplace, onSuccess }: Props) => {
  const { form, handleSubmit, handleChange } = useUpdateWorkplace({
    workplace: workplace,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const { handleDelete } = useDeleteWorkplace({
    workplace: workplace,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return(
    <FormDialog
      title='사업장 상세'
      open={open}
      onOpenChange={onOpenChange}
      cancelLabel='닫기'
      submitLabel='수정'
      deleteLabel='삭제'
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    >
      <FieldGroup>
        {/* 기관 정보 */}
        <SectionTitle>사업장 정보</SectionTitle>
        <InputGroup
          id="companyName"
          label="측정대행 의뢰기관"
          placeholder="측정대행 의뢰기관"
          value={workplace?.companyName ?? ''}
          helperText="사업자등록증상에 기재된 상호"
          startIcon={<Building2 />}
          disabled
          readOnly
        />
        <InputGroup
          id="name"
          label="측정대상 사업장"
          value={form.name}
          onChange={(value) => handleChange('name', value)}
          startIcon={<Building2 />}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="bizNumber"
            label="사업자등록번호"
            value={form.bizNumber}
            onChange={(value) => handleChange('bizNumber', value)}
            startIcon={<Hash />}
          />
        <InputGroup
          id="address"
          label="주소"
          value={form.address}
          onChange={(value) => handleChange('address', value)}
          startIcon={<MapPin />}
        />
        </div>
      </FieldGroup>
    </FormDialog>
  );
}
