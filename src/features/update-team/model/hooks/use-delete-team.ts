import { useDeleteTeamAction, type Team } from "@entities/team";

import { toast } from "@shared/ui/toasts";
import { useConfirm } from "@shared/ui/dialogs";

interface Props {
  team: Team | null;
  onSuccess?: () => void;
}

export const useDeleteTeam = ({ team, onSuccess }: Props) => {
  const { deleteTeam, isLoading } = useDeleteTeamAction();
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (!team) return;

    const isConfirmed = await confirm({
      title: '팀 삭제',
      description: `${team.name} 팀을 삭제합니다.\n삭제 후에는 되돌릴 수 없습니다.`,
      confirmLabel: '삭제',
      tone: 'danger',
    });
    if (!isConfirmed) return;

    try {
      await deleteTeam(team.id);
      toast.success(`${team.name} 팀이 삭제되었습니다.`);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : '삭제에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    isLoading,

    handleDelete,
  };
};
