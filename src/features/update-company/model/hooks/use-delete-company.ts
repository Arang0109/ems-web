import { useDeleteCompanyAction } from "@entities/company";
import type { Company } from "@entities/company";

import { toast } from "@shared/ui/toasts";

interface Props {
  company: Company | null;
  onSuccess: () => void;
}

export const useDeleteCompany = ({ company, onSuccess }: Props) => {
  const { deleteCompany, isLoading, error } = useDeleteCompanyAction();

  const handleDelete = async () => {
    if (!company) return;
    
    try {
      await deleteCompany(company.id);
      toast.success(`${company.name}이(가) 삭제되었습니다.`)
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '삭제에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    isLoading,
    error,

    handleDelete,
  }
}