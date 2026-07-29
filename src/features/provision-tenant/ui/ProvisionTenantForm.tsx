import { useProvisionTenant } from "../model/hooks/use-provision-tenant";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { InputGroup, SectionTitle, FieldGroup, Select } from "@shared/ui/form";

// Format
import { formatBusinessNumber, formatPhoneNumber, unformatNumber } from '@shared/lib';

// Icon
import { MailIcon, User2Icon, Phone, KeyRound, Building2, Briefcase, Hash } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ProvisionTenantForm = ({ open, onOpenChange, onSuccess }: Props) => {
  const { form, handleChange, handleSubmit, fieldErrors, planOptions } = useProvisionTenant({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      triggerLabel='고객사 발급'
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel='발급'
    >
      <FieldGroup>
        {/* 고객사 정보 */}
        <SectionTitle>고객사 정보</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="name"
            label="고객사명"
            placeholder="고객사명"
            value={form.name}
            onChange={(value) => handleChange("name", value)}
            invalid={!!fieldErrors?.name}
            error={fieldErrors?.name}
            required
            startIcon={<Building2 />}
          />
          <InputGroup
            id="bizNumber"
            label="사업자번호"
            placeholder="사업자번호"
            value={formatBusinessNumber(form.bizNumber)}
            onChange={(value) => handleChange("bizNumber", unformatNumber(value).slice(0, 10))}
            invalid={!!fieldErrors?.bizNumber}
            error={fieldErrors?.bizNumber}
            startIcon={<Hash />}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Select
            id="subscriptionPlan"
            label="요금제"
            placeholder="요금제 선택"
            options={planOptions}
            value={form.subscriptionPlan}
            onValueChange={(value) => handleChange("subscriptionPlan", value ?? "")}
            required
          />
        </div>

        <Divider />

        {/* 초기 관리자 계정 */}
        <SectionTitle>초기 관리자 계정</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="adminUsername"
            label="아이디"
            placeholder="아이디"
            value={form.adminUsername}
            onChange={(value) => handleChange("adminUsername", value)}
            invalid={!!fieldErrors?.adminUsername}
            error={fieldErrors?.adminUsername}
            required
            startIcon={<User2Icon />}
          />
          <InputGroup
            id="adminPassword"
            type="password"
            label="비밀번호"
            placeholder="비밀번호"
            value={form.adminPassword}
            onChange={(value) => handleChange("adminPassword", value)}
            invalid={!!fieldErrors?.adminPassword}
            error={fieldErrors?.adminPassword}
            required
            startIcon={<KeyRound />}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="adminName"
            label="이름"
            placeholder="이름"
            value={form.adminName}
            onChange={(value) => handleChange("adminName", value)}
            invalid={!!fieldErrors?.adminName}
            error={fieldErrors?.adminName}
            required
            startIcon={<User2Icon />}
          />
          <InputGroup
            id="adminDepartment"
            label="부서"
            placeholder="부서"
            value={form.adminDepartment}
            onChange={(value) => handleChange("adminDepartment", value)}
            startIcon={<Briefcase />}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="adminTel"
            label="전화번호"
            placeholder="전화번호"
            value={formatPhoneNumber(form.adminTel)}
            onChange={(value) => handleChange("adminTel", unformatNumber(value).slice(0, 11))}
            startIcon={<Phone />}
          />
          <InputGroup
            id="adminEmail"
            label="이메일"
            placeholder="이메일"
            value={form.adminEmail}
            onChange={(value) => handleChange("adminEmail", value)}
            invalid={!!fieldErrors?.adminEmail}
            error={fieldErrors?.adminEmail}
            startIcon={<MailIcon />}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
