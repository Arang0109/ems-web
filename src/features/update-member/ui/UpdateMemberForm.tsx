import { useUpdateMember } from '../model/hooks/use-update-member';
import { useDeleteMember } from '../model/hooks/use-delete-member';

import type { Member } from '@entities/member';

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { InputGroup, SectionTitle, FieldGroup, Select } from "@shared/ui/form";

// Format
import { formatPhoneNumber, unformatNumber } from '@shared/lib';

// Icon
import { MailIcon, User2Icon, Phone, Building2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onSuccess?: () => void;
}

export const UpdateMemberForm = ({ open, onOpenChange, member, onSuccess }: Props) => {

  const { form, handleSubmit, handleChange, roleOptions } = useUpdateMember({
    member: member,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const { handleDelete } = useDeleteMember({
    member: member,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  if (!member) return;

  return (
    <FormDialog
      title='회원 상세'
      open={open}
      onOpenChange={onOpenChange}
      deleteLabel='삭제'
      cancelLabel='닫기'
      submitLabel='수정'
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    >
      <FieldGroup>
        <SectionTitle>계정 정보</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="username"
            label="아이디"
            value={member.username}
            onChange={() => {}}
            readOnly
            disabled
            startIcon={<User2Icon />}
          />
          <InputGroup
            id="name"
            label="이름"
            value={form.name}
            onChange={(value) => handleChange('name', value)}
            startIcon={<User2Icon />}
          />
        </div>
        <Select
          id="roleId"
          label="역할"
          placeholder="역할 선택"
          options={roleOptions}
          value={form.roleId}
          onValueChange={(value) => handleChange('roleId', value ?? "")}
        />

        <Divider />

        <SectionTitle>상세 정보</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup
            id="department"
            placeholder="부서"
            value={form.department}
            onChange={(value) => handleChange('department', value)}
            startIcon={<Building2 />}
          />
          <InputGroup
            id="tel"
            placeholder="전화번호"
            value={formatPhoneNumber(form.tel)}
            onChange={(value) => handleChange('tel', unformatNumber(value).slice(0, 11))}
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
