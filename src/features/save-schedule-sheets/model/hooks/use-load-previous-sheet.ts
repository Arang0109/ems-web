import { useState } from "react";

import { usePreviousSheet, usePreviousSheetCandidates } from "@entities/schedule";
import type { PreviousSheetCandidate } from "@entities/schedule";
import { formatDate } from "@shared/lib";
import { MEASUREMENT_CATEGORY_LABEL } from "@shared/config";
import { toast } from "@shared/ui/toasts";

import type { SheetForm } from "../types";
import { fromSheet } from "../mapper";

interface Params {
  scheduleId: number | null;
  activeSheet: SheetForm | null;
  updateActiveSheet: (updater: (sheet: SheetForm) => SheetForm) => void;
  /** 화면에 채운 직후 — 어느 칸이 지난 회차 값인지 추적하도록 스냅샷을 넘긴다 */
  onLoaded?: (loaded: SheetForm, sourceLabel: string) => void;
}

/** 다이얼로그에 실을 출처 표기 — 내부 식별 코드가 있으면 함께 보여 회차를 특정할 수 있게 한다. */
export const describePreviousSource = (candidate: PreviousSheetCandidate): string =>
  candidate.referenceNumber
    ? `${formatDate(candidate.sampledAt)} | ${candidate.referenceNumber}`
    : `${formatDate(candidate.sampledAt)}`;

/**
 * 활성 기록지를 이전 회차 값으로 채운다.
 *
 * <p>저장하지는 않는다 — 값을 확인·수정한 뒤 기존 저장 버튼으로 보내야 시트 낙관적 락 밖의
 * 쓰기 경로가 생기지 않고, 잘못 눌렀을 때도 저장만 하지 않으면 그만이다.
 *
 * <p>가져올 회차는 <b>사용자가 고른다.</b> 가장 최근 회차가 늘 좋은 출발점은 아니어서
 * (이상 조업이었거나 값이 어긋난 회차) 그 앞 회차를 출발점으로 삼고 싶은 경우가 있다.
 * 그래서 먼저 후보 목록만 받아 고르게 하고, 시트 본문은 고른 회차 것만 받아 온다.
 *
 * <p>확인 다이얼로그를 따로 두지 않는다 — 선택 목록 자체가 "어느 회차에서 가져오는지"를
 * 보여주고 경고 문구를 싣고 있어, 확인을 한 번 더 받으면 같은 결정을 두 번 묻는 꼴이 된다.
 */
export const useLoadPreviousSheet = ({
  scheduleId, activeSheet, updateActiveSheet, onLoaded,
}: Params) => {
  const { fetchCandidates, isLoading: isLoadingCandidates } = usePreviousSheetCandidates();
  const { fetchPreviousSheet, isLoading: isLoadingSheet } = usePreviousSheet();

  const [candidates, setCandidates] = useState<PreviousSheetCandidate[]>([]);
  const [isPickerOpen, setPickerOpen] = useState(false);

  // 불러오기에 성공할 때마다 증가시켜 기록지 뷰를 리마운트한다.
  // 배출가스 입력칸 노출 판정처럼 마운트 시점에 고정되는 내부 상태가 있어서,
  // 시트 내용만 갈아끼우면 불러온 값에 맞춰 갱신되지 않는다.
  const [loadedKey, setLoadedKey] = useState(0);

  /** 후보를 받아 선택 목록을 연다. 후보가 없으면 열지 않고 그 자리에서 알린다. */
  const handleOpenPrevious = async () => {
    if (scheduleId == null || !activeSheet) return;

    const label = MEASUREMENT_CATEGORY_LABEL[activeSheet.category];
    const { candidates: found, errorMessage } = await fetchCandidates(scheduleId, activeSheet.category);

    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }
    if (found.length === 0) {
      toast.info(`불러올 이전 ${label} 기록지가 없습니다.`);
      return;
    }

    setCandidates(found);
    setPickerOpen(true);
  };

  /** 고른 회차의 시트를 받아 활성 기록지에 채운다. */
  const handleSelectPrevious = async (sourceScheduleId: number) => {
    if (scheduleId == null || !activeSheet) return;

    const { previous, errorMessage } = await fetchPreviousSheet(
      scheduleId, activeSheet.category, sourceScheduleId,
    );

    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }
    // 목록을 띄운 사이 그 회차가 재개방돼 완료가 아니게 된 경우다. 목록이 낡았으니 닫고 다시 받게 한다.
    if (!previous) {
      toast.error("선택한 회차의 기록지를 불러올 수 없습니다. 목록을 다시 열어 주세요.");
      setPickerOpen(false);
      return;
    }

    // 스냅샷은 화면에 실제로 들어간 값이어야 한다 — 카테고리만 현재 기록지 것으로 맞춘다
    // (version 은 입력 칸이 아니라 강조 판정에 쓰이지 않는다).
    const loaded: SheetForm = { ...fromSheet(previous.sheet), category: activeSheet.category };
    const sourceLabel = describePreviousSource(previous);

    updateActiveSheet((current) => ({
      ...loaded,
      category: current.category,
      version: current.version,
    }));
    onLoaded?.(loaded, sourceLabel);
    setLoadedKey((prev) => prev + 1);
    setPickerOpen(false);

    toast.success(`${sourceLabel} 기록을 불러왔습니다. 확인 후 저장하세요.`);
  };

  return {
    handleOpenPrevious,
    handleSelectPrevious,
    candidates,
    isPickerOpen,
    setPickerOpen,
    isLoadingCandidates,
    isLoadingSheet,
    loadedKey,
  };
};
