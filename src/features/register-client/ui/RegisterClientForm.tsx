import { useRegisterClient } from "../model/hooks/use-register-client";

// UI

import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { FieldGroup, InputGroup, SectionTitle, AddressInput } from "@shared/ui/form";

// Format

// Icon
import { MailIcon, User2Icon, Phone, Building2, Hash, Plus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegisterClientForm = ({ open, onOpenChange, onSuccess }: Props) => {
  const { form, handleChange, handleAddressChange, handleSubmit, fieldErrors } = useRegisterClient({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      triggerLabel={<><Plus /> 등록</>}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel='등록'
    >
      <FieldGroup>
        {/* 기관 정보 */}
        <SectionTitle>기관 정보</SectionTitle>
        <InputGroup
          id="name"
          label="측정대행 의뢰기관"
          placeholder="측정대행 의뢰기관"
          value={form.name}
          onChange={(value) => handleChange("name", value)}
          helperText="사업자등록증상에 기재된 상호"
          invalid={!!fieldErrors?.name}
          error={fieldErrors?.name}
          required
          startIcon={<Building2 />}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="bizNumber"
            label="사업자등록번호"
            placeholder="사업자등록번호"
            code="business"
            value={form.bizNumber}
            onChange={(value) => handleChange("bizNumber", value)}
            startIcon={<Hash />}
            invalid={!!fieldErrors?.bizNumber}
            error={fieldErrors?.bizNumber}
          />
          <InputGroup
            id="representative"
            label="대표자"
            placeholder="대표자"
            value={form.representative}
            onChange={(value) => handleChange("representative", value)}
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

        {/* 담당자 정보 */}
        <SectionTitle>담당자 정보</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup
            id="manager"
            placeholder="담당자명"
            value={form.manager}
            onChange={(value) => handleChange("manager", value)}
            startIcon={<User2Icon />}
          />
          <InputGroup
            id="tel"
            placeholder="전화번호"
            code="phone"
            value={form.tel}
            onChange={(value) => handleChange("tel", value)}
            startIcon={<Phone />}
          />
          <InputGroup
            id="email"
            placeholder="이메일"
            value={form.email}
            onChange={(value) => handleChange("email", value)}
            startIcon={<MailIcon />}
          />
        </div>
      </FieldGroup>
    </FormDialog>
    
  );
};
