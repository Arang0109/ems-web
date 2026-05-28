import { useState, useCallback } from "react";

import { companyApi } from "@entities/company";
import type { CompanyDetail } from "@entities/company";

export const useCompanyDetail = () => {
  const [company, setCompany] = useState<CompanyDetail | null>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchCompany = useCallback(async (companyId: number) => {
    setIsLoading(true);

    try {
      const { status, data } = await companyApi.getCompanyDetail(companyId);
      setCompany(status ? data : null);
    } catch (error) {
      console.error(error);
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { company, fetchCompany, isLoading };
}