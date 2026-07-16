import { useDeleteTeamAction, type Team } from "@entities/team";

import { toast } from "@shared/ui/toasts";

interface Props {
  team: Team | null;
  onSuccess?: () => void;
}

export const useDeleteTeam = ({ team, onSuccess }: Props) => {
  const { deleteTeam, isLoading } = useDeleteTeamAction();

  const handleDelete = async () => {
    if (!team) return;

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
