import { useDeleteCompanyAction } from "@entities/company";
import type { Company } from "@entities/company";

interface Props {
  company: Company | null;
  onSuccess: () => void;
}

export const useDeleteCompany = ({ company, onSuccess }: Props) => {
  const { deleteCompany, isLoading, error } = useDeleteCompanyAction({ onSuccess });

  const handleDelete = async () => {
    if (!company) return;
    await deleteCompany(company);
  };

  return {
    isLoading,
    error,

    handleDelete,
  }
}