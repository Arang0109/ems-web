import { useDeleteMemberAction, type Member } from "@entities/member";

import { toast } from "@shared/ui/toasts";

interface Props {
  member: Member | null;
  onSuccess?: () => void;
}

export const useDeleteMember = ({ member, onSuccess }: Props) => {
  const { deleteMember, isLoading } = useDeleteMemberAction();

  const handleDelete = async () => {
    if (!member) return;

    try {
      await deleteMember(member.id);
      toast.success(`${member.name}이(가) 삭제되었습니다.`)
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : '삭제에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    isLoading,

    handleDelete,
  }
}
