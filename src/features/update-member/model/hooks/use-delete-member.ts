import { useDeleteMemberAction, type Member } from "@entities/member";

import { toast } from "@shared/ui/toasts";
import { useConfirm } from "@shared/ui/dialogs";

interface Props {
  member: Member | null;
  onSuccess?: () => void;
}

export const useDeleteMember = ({ member, onSuccess }: Props) => {
  const { deleteMember, isLoading } = useDeleteMemberAction();
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (!member) return;

    const isConfirmed = await confirm({
      title: '회원 삭제',
      description: `${member.name} 회원 계정을 삭제합니다.\n삭제 후에는 되돌릴 수 없습니다.`,
      confirmLabel: '삭제',
      tone: 'danger',
    });
    if (!isConfirmed) return;

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
