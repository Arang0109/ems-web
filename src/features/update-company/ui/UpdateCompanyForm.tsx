import { useUpdateCompany } from '../model/hooks/use-update-company';
import { useDeleteCompany } from '../model/hooks/use-delete-company';

import type { Company } from '@entities/company';

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { InputGroup, SectionTitle, FieldGroup, AddressInput } from "@shared/ui/form";

// Format
import { formatPhoneNumber, unformatNumber, formatBusinessNumber } from '@shared/lib';

// Icon
import { MailIcon, User2Icon, Phone, Building2, Hash } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  onSuccess?: () => void;
}

export const UpdateCompanyForm = ({ open, onOpenChange, company, onSuccess }: Props) => {

  const { form, handleSubmit, handleAddressChange, handleChange } = useUpdateCompany({
    company: company,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const { handleDelete } = useDeleteCompany({
    company: company,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });
  
  if (!company) return;

  return (
    <FormDialog
      title='의뢰기관 상세'
      open={open}
      onOpenChange={onOpenChange}
      deleteLabel='삭제'
      cancelLabel='닫기'
      submitLabel='수정'
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    >
      <FieldGroup>
        <SectionTitle>기관 정보</SectionTitle>
        <InputGroup
          id="name"
          label="측정대행 의뢰기관"
          value={form.name}
          onChange={(value) => handleChange('name', value)}
          startIcon={<Building2 />}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="bizNumber"
            label="사업자등록번호"
            value={formatBusinessNumber(form.bizNumber)}
            onChange={(value) => handleChange("bizNumber", unformatNumber(value).slice(0, 10))}
            startIcon={<Hash />}
          />
          <InputGroup
            id="representative"
            label="대표자"
            value={form.representative}
            onChange={(value) => handleChange('representative', value)}
            startIcon={<User2Icon />}
          />
        </div>
        <AddressInput
          id="address"
          placeholder="상세주소"
          value={{ zipcode: form.zipcode, roadAddress: form.roadAddress, detailAddress: form.address }}
          onChange={handleAddressChange}
        />

        <Divider />

        <SectionTitle>담당자 정보</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup
            id="manager"
            placeholder="담당자명"
            value={form.manager}
            onChange={(value) => handleChange('manager', value)}
            startIcon={<User2Icon />}
          />
          <InputGroup
            id="tel"
            placeholder="전화번호"
            value={formatPhoneNumber(form.tel)}
            onChange={(value) => handleChange('tel', value)}
            startIcon={<Phone />}
          />
          <InputGroup
            id="email"
            placeholder="이메일"
            value={form.email}
            onChange={(value) => handleChange('email', value)}
            startIcon={<MailIcon />}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
