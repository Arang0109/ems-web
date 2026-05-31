import { FieldGroup } from "@/components/ui/field";
import { Divider } from "@shared/ui/borders";

import type { CompanyRegisterForm } from "../model/register-company-types";
import { InputGroup, SectionTitle } from "@/shared/ui/form";
import { formatBusinessNumber, formatPhoneNumber } from '@shared/lib/formatters';

import { MailIcon, User2Icon, Phone, Building2, Hash, MapPin } from "lucide-react";

interface RegisterCompanyFormProps {
  form: CompanyRegisterForm;
  onChange: (name: keyof CompanyRegisterForm, value: string) => void
}

export const RegisterCompanyForm = ({
  form,
  onChange,
}: RegisterCompanyFormProps) => {

  return (
    <FieldGroup>
      {/* 기관 정보 */}
      <SectionTitle>기관 정보</SectionTitle>
      <InputGroup
        id="name"
        label="측정대행 의뢰기관"
        placeholder="측정대행 의뢰기관"
        value={form.name}
        onChange={(value) => onChange("name", value)}
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
          onChange={(value) => onChange("bizNumber", value)}
          startIcon={<Hash />}
        />
        <InputGroup
          id="ceoName"
          label="대표자"
          placeholder="대표자"
          value={form.ceoName}
         onChange={(value) => onChange("ceoName", value)}
          startIcon={<User2Icon />}
        />
      </div>
      <InputGroup
        id="address"
        label="주소"
        placeholder="주소"
        value={form.address}
        onChange={(value) => onChange("address", value)}
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
          onChange={(value) => onChange("manager", value)}
          startIcon={<User2Icon />}
        />
        <InputGroup
          id="tell"
          placeholder="전화번호"
          value={formatPhoneNumber(form.tell)}
          onChange={(value) => onChange("tell", value)}
          startIcon={<Phone />}
        />
        <InputGroup
          id="email"
          placeholder="이메일"
          value={form.email}
          onChange={(value) => onChange("email", value)}
          startIcon={<MailIcon />}
        />
      </div>
    </FieldGroup>
  );
};
