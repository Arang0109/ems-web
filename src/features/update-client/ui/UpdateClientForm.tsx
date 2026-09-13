import { useUpdateClient } from '../model/hooks/use-update-client';
import { useDeleteClient } from '../model/hooks/use-delete-client';

import type { Client } from '@entities/client';

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { InputGroup, SectionTitle, FieldGroup, AddressInput } from "@shared/ui/form";

// Icon
import { MailIcon, User2Icon, Phone, Building2, Hash } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSuccess?: () => void;
}

export const UpdateClientForm = ({ open, onOpenChange, client, onSuccess }: Props) => {

  const { form, handleSubmit, handleAddressChange, handleChange } = useUpdateClient({
    client: client,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const { handleDelete } = useDeleteClient({
    client: client,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });
  
  if (!client) return;

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
            code="business"
            value={form.bizNumber}
            onChange={(value) => handleChange("bizNumber", value)}
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
          value={{ zipcode: form.zipcode, roadAddress: form.roadAddress, detailAddress: form.detailAddress }}
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
            code="phone"
            value={form.tel}
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
