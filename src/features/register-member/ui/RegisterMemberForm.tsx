import { useRegisterMember } from "../model/hooks/use-register-member";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { InputGroup, SectionTitle, FieldGroup, Select } from "@shared/ui/form";

// Format
import { formatPhoneNumber, unformatNumber } from '@shared/lib';

// Icon
import { MailIcon, User2Icon, Phone, KeyRound, Building2, Plus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegisterMemberForm = ({ open, onOpenChange, onSuccess }: Props) => {
  const { form, handleChange, handleSubmit, fieldErrors, roleOptions } = useRegisterMember({
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
        {/* 계정 정보 */}
        <SectionTitle>계정 정보</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="username"
            label="아이디"
            placeholder="아이디"
            value={form.username}
            onChange={(value) => handleChange("username", value)}
            invalid={!!fieldErrors?.username}
            error={fieldErrors?.username}
            required
            startIcon={<User2Icon />}
          />
          <InputGroup
            id="password"
            type="password"
            label="비밀번호"
            placeholder="비밀번호"
            value={form.password}
            onChange={(value) => handleChange("password", value)}
            invalid={!!fieldErrors?.password}
            error={fieldErrors?.password}
            required
            startIcon={<KeyRound />}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="name"
            label="이름"
            placeholder="이름"
            value={form.name}
            onChange={(value) => handleChange("name", value)}
            invalid={!!fieldErrors?.name}
            error={fieldErrors?.name}
            required
            startIcon={<User2Icon />}
          />
          <Select
            id="roleId"
            label="역할"
            placeholder="역할 선택"
            options={roleOptions}
            value={form.roleId}
            onValueChange={(value) => handleChange("roleId", value ?? "")}
            required
          />
        </div>

        <Divider />

        {/* 상세 정보 */}
        <SectionTitle>상세 정보</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup
            id="department"
            placeholder="부서"
            value={form.department}
            onChange={(value) => handleChange("department", value)}
            startIcon={<Building2 />}
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
            invalid={!!fieldErrors?.email}
            error={fieldErrors?.email}
            startIcon={<MailIcon />}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
