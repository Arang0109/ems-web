import { useMemo, useState } from "react";

import { MEASUREMENT_CATEGORY_LABEL } from "@shared/config";
import type { useConfirm } from "@shared/ui/dialogs";
import { toast } from "@shared/ui/toasts";

import type { SheetForm } from "../types";
import { copyCommonSections, findSyncSource, hasCommonSectionValues } from "../input/common-sections";

interface Params {
  sheets: SheetForm[];
  activeIndex: number;
  updateActiveSheet: (updater: (sheet: SheetForm) => SheetForm) => void;
  confirm: ReturnType<typeof useConfirm>;
}

/**
 * 활성 기록지의 기상정보·수분량·배출가스와 측정점 온도·동정압(배출가스 온도·동압·정압·DGM 입/출구 온도)을 바로 앞 기록지 값으로 맞춘다.
 *
 * 같은 회차의 같은 굴뚝이라 세 섹션은 기록지마다 같은데, 두 번째 기록지를 추가하면 빈 채로 시작해 같은 값을
 * 다시 적어야 했다. 저장하지는 않는다 — 이전 회차 불러오기와 같은 이유로 값을 확인한 뒤 저장 버튼으로 보낸다.
 * 이미 적은 값이 있으면 덮어쓰기 전에 한 번 묻고, 아무것도 안 적혀 있으면 묻지 않는다.
 */
export const useSyncCommonSections = ({ sheets, activeIndex, updateActiveSheet, confirm }: Params) => {
  // 동기화할 때마다 올려 기록지 뷰를 리마운트한다 — 배출가스 입력칸 노출 판정이 마운트 시점에 고정되기 때문이다
  // (이전 회차 불러오기의 loadedKey 와 같은 이유).
  const [syncedKey, setSyncedKey] = useState(0);

  const source = findSyncSource(sheets, activeIndex);
  const active = sheets[activeIndex] ?? null;
  const canSync = source !== null && active !== null;

  // 버튼·배너가 "어디서" 가져오는지 이름으로 말한다 (예: "먼지 기록지")
  const sourceLabel = source ? `${MEASUREMENT_CATEGORY_LABEL[source.category]} 기록지` : "";
  // 이미 적어 둔 값이 있으면 제안 배너 대신 작은 버튼만 남긴다
  const hasValues = useMemo(() => (active ? hasCommonSectionValues(active) : false), [active]);

  const handleSyncCommonSections = async () => {
    if (!source || !active) return;

    if (hasValues) {
      const isConfirmed = await confirm({
        title: `${sourceLabel} 값으로 덮어쓸까요?`,
        description: `${sourceLabel}의 기상정보·수분량·배출가스와 측정점 온도·동정압(배출가스 온도·동압·정압·DGM 입/출구 온도)을 가져옵니다.\n이 기록지에 적어 둔 그 값들은 사라집니다.`,
        confirmLabel: "가져오기",
        cancelLabel: "취소",
        tone: "danger",
      });
      if (!isConfirmed) return;
    }

    updateActiveSheet((current) => copyCommonSections(current, source));
    setSyncedKey((prev) => prev + 1);
    toast.success(`${sourceLabel}의 기상정보·수분량·배출가스·측정점 온도·동정압을 가져왔습니다. 확인 후 저장하세요.`);
  };

  return { canSync, sourceLabel, hasValues, handleSyncCommonSections, syncedKey };
};
