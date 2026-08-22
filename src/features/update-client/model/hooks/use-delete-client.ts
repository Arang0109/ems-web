import { useDeleteClientAction, type Client } from "@entities/client";

import { toast } from "@shared/ui/toasts";
import { useConfirm } from "@shared/ui/dialogs";

interface Props {
  client: Client | null;
  onSuccess?: () => void;
}

export const useDeleteClient = ({ client, onSuccess }: Props) => {
  const { deleteClient, isLoading } = useDeleteClientAction();
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (!client) return;

    const isConfirmed = await confirm({
      title: '의뢰기관 삭제',
      description: `${client.name}을(를) 삭제합니다.\n삭제 후에는 되돌릴 수 없습니다.`,
      confirmLabel: '삭제',
      tone: 'danger',
    });
    if (!isConfirmed) return;

    try {
      await deleteClient(client.id);
      toast.success(`${client.name}이(가) 삭제되었습니다.`)
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