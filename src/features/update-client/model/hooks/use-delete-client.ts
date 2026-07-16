import { useDeleteClientAction, type Client } from "@entities/client";

import { toast } from "@shared/ui/toasts";

interface Props {
  client: Client | null;
  onSuccess?: () => void;
}

export const useDeleteClient = ({ client, onSuccess }: Props) => {
  const { deleteClient, isLoading, error } = useDeleteClientAction();

  const handleDelete = async () => {
    if (!client) return;
       
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