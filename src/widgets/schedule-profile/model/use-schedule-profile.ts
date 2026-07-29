import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useScheduleDetail, useDeleteScheduleAction } from "@entities/schedule";

// 측정계획 상세를 로드하고, 편집 가능 여부(완료/취소 제외)를 계산한다.
export const useScheduleProfile = (scheduleId: string | undefined) => {
  const { data, loading, error, fetchSchedule } = useScheduleDetail();
  const { deleteSchedule, isLoading, error: deleteError } = useDeleteScheduleAction();
  const navigate = useNavigate();

  useEffect(() => {
    if (!scheduleId) return;
    fetchSchedule(Number(scheduleId));
  }, [scheduleId, fetchSchedule]);

  const status = data?.status ?? null;
  const editable = status !== null && status !== "COMPLETED" && status !== "CANCELED";

  const handleDelete = () => {
    if (!scheduleId) return;
    deleteSchedule(Number(scheduleId));
    navigate("/schedule");
  };

  return {
    scheduleId: scheduleId ? Number(scheduleId) : null,
    detail: data,
    snapshot: data?.snapshot ?? null,
    status,
    editable,
    loading,
    error,
    refetch: () => {
      if (!scheduleId) return;
      fetchSchedule(Number(scheduleId));
    },

    handleDelete,
    deleteLoading: isLoading,
    deleteError,
  };
};
