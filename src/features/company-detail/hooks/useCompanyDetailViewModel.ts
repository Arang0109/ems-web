import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { useCompanyDetail } from "./useCompanyDetail";

export const useCompanyDetailViewModel = () => {
  const navigate = useNavigate();
  const goBack = () => navigate("/company");

  const { companyId } = useParams();
  const { company, fetchCompany, isLoading } = useCompanyDetail();

  useEffect(() => {
    if (companyId) fetchCompany(Number(companyId));
  }, [companyId, fetchCompany]);

  return {
    company,

    goBack,

    isLoading
  }
}