import { useUpdateWorkplace } from '../model/hooks/use-update-workplace';
import { useDeleteWorkplace } from '../model/hooks/use-delete-workplace';

import type { Workplace } from '@entities/workplace';

import { FormDialog } from "@shared/ui/dialogs";
import { FieldGroup, InputGroup, SectionTitle, AddressInput, Select } from "@shared/ui/form";
import type { Grade } from "@shared/model";
import { gradeOptions } from "@shared/model";
import { GRADE_LABEL } from "@shared/config";

import { Building2, Hash, User2 } from "lucide-react";
import type { Client } from '@/entities/client';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  workplace: Workplace | null;
  onSuccess?: () => void;
}

export const UpdateWorkplaceForm = ({ open, onOpenChange, client, workplace, onSuccess }: Props) => {
  const { form, handleSubmit, handleAddressChange, handleChange } = useUpdateWorkplace({
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
          id="clientName"
          label="측정대행 의뢰기관"
          placeholder="측정대행 의뢰기관"
          value={client?.name ?? ''}
          helperText="사업자등록증상에 기재된 상호"
          startIcon={<Building2 />}
          disabled
          readOnly
        />
        <div className="grid md:grid-cols-2 gap-4">
        <InputGroup
          id="name"
          label="측정대상 사업장"
          value={form.name}
          onChange={(value) => handleChange('name', value)}
          startIcon={<Building2 />}
        />
          <InputGroup
            id="bizNumber"
            label="사업자등록번호"
            value={form.bizNumber}
            onChange={(value) => handleChange('bizNumber', value)}
            startIcon={<Hash />}
          />
        </div>
          <Select
            id="grade"
            label="시설 종별"
            placeholder="종별 선택"
            options={gradeOptions}
            value={GRADE_LABEL[form.grade]}
            onValueChange={(value) => value && handleChange("grade", value as Grade)}
          />
        <AddressInput
          id="address"
          placeholder="상세주소"
          value={{ zipcode: form.zipcode, roadAddress: form.roadAddress, detailAddress: form.address }}
          onChange={handleAddressChange}
        />
        <InputGroup
          id="facilityManager"
          label="배출시설 관리자"
          placeholder="배출시설 관리자"
          value={form.facilityManager}
          onChange={(value) => handleChange("facilityManager", value)}
          startIcon={<User2 />}
        />
        <InputGroup
          id="samplingWitness"
          label="환경기술인"
          placeholder="채취 증인"
          value={form.samplingWitness}
          onChange={(value) => handleChange("samplingWitness", value)}
          startIcon={<User2 />}
        />
      </FieldGroup>
    </FormDialog>
  );
}
