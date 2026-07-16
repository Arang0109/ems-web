import { useState } from "react";

import type { MemberUpdateForm } from "../types";
import { toMemberUpdate } from "../mapper";

import { useUpdateMemberAction, useRoles } from "@entities/member";
import type { Member } from "@entities/member";

import { toast } from "@shared/ui/toasts";
import type { SelectOption } from "@shared/ui/form";

interface Props {
  member: Member | null;
  onSuccess: () => void;
}

export const useUpdateMember = ({ member, onSuccess }: Props) => {
  const { updateMember, isLoading } = useUpdateMemberAction();
  const { data: roles } = useRoles();

  const [form, setForm] = useState<MemberUpdateForm>({
    name: member?.name ?? '',
    roleId: member?.roleId != null ? String(member.roleId) : '',
    department: member?.department ?? '',
    email: member?.email ?? '',
    tel: member?.tel ?? '',
  });

  const roleOptions: SelectOption[] = roles.map((role) => ({
    value: String(role.roleId),
    label: role.description,
  }));

  const handleChange = (name: keyof MemberUpdateForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    if (!member) return;
    e.preventDefault();

    try {
      await updateMember(member.id, toMemberUpdate(form));
      toast.success(`${member.name} 이/가 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '수정에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    form,
    isLoading,

    roleOptions,

    handleSubmit,
    handleChange,
  }
}
