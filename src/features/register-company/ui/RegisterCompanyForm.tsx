import { useRegisterCompany } from "../model/hooks/use-register-company";

// UI
import { FieldGroup } from "@/components/ui/field";
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { InputGroup, SectionTitle } from "@shared/ui/form";

// Format
import { formatBusinessNumber, formatPhoneNumber, unformatNumber } from '@shared/lib';

// Icon
import { MailIcon, User2Icon, Phone, Building2, Hash, MapPin } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegisterCompanyForm = ({ open, onOpenChange, onSuccess }: Props) => {
  const { form, handleChange, handleSubmit } = useRegisterCompany({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      triggerLabel='측정대행 의뢰기관 등록'
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
          required
          startIcon={<Building2 />}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="bizNumber"
            label="사업자등록번호"
            placeholder="사업자등록번호"
            value={formatBusinessNumber(form.bizNumber)}
            onChange={(value) => handleChange("bizNumber", unformatNumber(value).slice(0, 10))}
            startIcon={<Hash />}
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
        <InputGroup
          id="address"
          label="주소"
          placeholder="주소"
          value={form.address}
          onChange={(value) => handleChange("address", value)}
          startIcon={<MapPin />}
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
            value={formatPhoneNumber(form.tel)}
            onChange={(value) => handleChange("tel", unformatNumber(value).slice(0, 11))}
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
