import { useState, useEffect } from "react";

import type { Workplace, WorkplaceTableCols } from "@entities/workplace";
import { workplaceTableColsToWorkplace } from "@entities/workplace";
import type { StackTableRow } from "@entities/stack";
import { stackApi } from "@entities/stack";

export const useSelectWorkplace = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | null>(null);
  const [StackTableData, setStackTableData] = useState<StackTableRow[]>([]);

  const handleSelectWorkplaceRow = (workplace: WorkplaceTableCols) => {
    setSelectedWorkplace(workplaceTableColsToWorkplace(workplace));
  };

  const clearStackTableData = () => {
    setStackTableData([]);
  }

  useEffect(() => {
    const fetchStackTable = async () => {
      try {
        if (selectedWorkplace == null) return;
        setIsLoading(true);
        clearStackTableData();
        const res = await stackApi.getStacksByWorkplace(selectedWorkplace.id);
        setStackTableData(res.data);
      } catch {
        setError('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStackTable();

  }, [selectedWorkplace])

  return {
    selectedWorkplace,
    StackTableData,

    isLoading, error,

    handleSelectWorkplaceRow,
    clearStackTableData,
  }
}