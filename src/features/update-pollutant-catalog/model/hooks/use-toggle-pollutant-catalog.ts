import { useTogglePollutantCatalogAction } from "@entities/pollutant-catalog";
import type { PollutantCatalog } from "@entities/pollutant-catalog";

import { withSubjectJosa } from "@shared/lib";
import { toast } from "@shared/ui/toasts";
import { useConfirm } from "@shared/ui/dialogs";

interface Props {
  catalog: PollutantCatalog | null;
  onSuccess?: () => void;
}

/**
 * 카탈로그 폐지/해제.
 *
 * 폐지는 모든 고객사의 선택 목록에 영향을 주므로 확인 단계를 둔다.
 * 해제는 되돌리기 쉬운 방향이라 확인 없이 바로 실행한다.
 */
export const useTogglePollutantCatalog = ({ catalog, onSuccess }: Props) => {
  const { setPollutantCatalogActive, isLoading } = useTogglePollutantCatalogAction();
  const confirm = useConfirm();

  const isActive = catalog?.active ?? false;
  const toggleLabel = isActive ? '폐지' : '폐지 해제';

  const handleToggle = async () => {
    if (!catalog) return;

    if (isActive) {
      const isConfirmed = await confirm({
        title: '측정물질 폐지',
        description: `${catalog.nameKr}(${catalog.code})을(를) 모든 고객사의 선택 목록에서 감춥니다.\n이미 등록해 사용 중인 고객사의 데이터는 그대로 유지됩니다.`,
        confirmLabel: '폐지',
        tone: 'danger',
      });
      if (!isConfirmed) return;
    }

    try {
      await setPollutantCatalogActive(catalog.id, !isActive);
      toast.success(
        isActive
          ? `${withSubjectJosa(catalog.nameKr)} 폐지되었습니다.`
          : `${withSubjectJosa(catalog.nameKr)} 다시 선택 목록에 노출됩니다.`,
      );
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : '상태 변경에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    isLoading,

    isActive,
    toggleLabel,

    handleToggle,
  };
};
