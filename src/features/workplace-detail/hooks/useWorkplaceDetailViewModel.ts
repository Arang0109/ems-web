import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { useWorkplaceDetail } from "./useWorkplaceDetail";

export const useWorkplaceDetailViewModel = () => {
  const navigate = useNavigate();
  const goBack = () => navigate("/workplaces");

  const { workplaceId } = useParams();
  const { workplace, fetchWorkplace, isLoading } = useWorkplaceDetail();

  useEffect(() => {
    if (workplaceId) fetchWorkplace(Number(workplaceId));
  }, [workplaceId, fetchWorkplace]);

  return {
    workplace,

    goBack,

    isLoading
  }
}