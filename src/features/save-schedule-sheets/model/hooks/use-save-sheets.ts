import { useCallback, useMemo, useState } from "react";

import type {
  SamplingSheet, ScheduleSnapshot, SheetCalcPreview, SheetCalcExternals, SheetRef,
} from "@entities/schedule";
import {
  calcSheetPreview, calcRequiredPointCount, useSaveSheetsAction, useFetchScheduleDetail,
} from "@entities/schedule";
import { useAuth } from "@entities/auth";
import { ApiError } from "@shared/api";
import type { MeasurementCategory, ScheduleStatus } from "@shared/model";
import { SCHEDULE_STATUS_LABEL, ERROR_MESSAGE } from "@shared/config";
import { useConfirm } from "@shared/ui/dialogs";
import { toast } from "@shared/ui/toasts";

import type { SheetForm } from "../types";
import { getDefaultSheetForm } from "../types";
import { toSheetSave, fromSheet } from "../mapper";
import {
  describeMissingRequired, describeMoistureWeightIssues, validateSheetFields,
} from "../input/validator";
import { buildGasSampleGroups, hydrateSheets } from "../gaseous/gaseous-rows";
import type { RemoteSyncResult } from "../sync/remote-sync";
import type { SheetBaseline } from "../sync/conflict";
import { getChangedSheets, toSheetBaseline } from "../sync/conflict";
import { useScheduleBasicInfo } from "./use-schedule-basic-info";
import { useExportSamplingRecords } from "./use-export-sampling-records";
import { useSheetRules } from "./use-sheet-rules";
import { useRemoteSheetsSync } from "./use-remote-sheets-sync";
import { useSheetConflict } from "./use-sheet-conflict";

interface Params {
  scheduleId: number | null;
  snapshot: ScheduleSnapshot | null;
  // 저장 전후 상태 비교용. 스냅샷에도 status 사본이 있었으나 서버가 더는 내려보내지 않으며,
  // 진실의 원천은 응답 최상위(메타)다 — 비교 양쪽을 같은 출처로 맞춘다.
  status: ScheduleStatus | null;
  externals: SheetCalcExternals;
  onSaved?: () => void;
}

// 저장 결과. 서버가 상태를 전진시켰으면(시트 최초 저장·시료접수일 최초 입력) advancedTo에 새 상태가 담긴다.
type SaveResult = { ok: false } | { ok: true; advancedTo: ScheduleStatus | null };

/**
 * 측정계획의 전체 시트 세트를 관리하는 파사드. 저장은 시트 세트를 한 번에 보내지만 서버는 요청에 담긴
 * 카테고리만 교체하므로(나머지는 보관본 유지), 삭제는 deletedSheets 로 명시해 보낸다.
 *
 * 이 훅이 소유하는 것은 **폼 상태와 저장 파이프라인**뿐이다. 항목 규칙 파생은 `useSheetRules`, 다른 사용자의
 * 저장 병합은 `useRemoteSheetsSync`, 409 복구는 `useSheetConflict` 가 맡고, 상태 변경은 전부 여기로 되돌아온다.
 * 계산값 표시는 previewCalc(서버 파이프라인 풀 미러링)가 담당한다 — 저장 후에도 폼 값에서 동일하게 재현된다.
 */
export const useSaveSheets = ({
  scheduleId, snapshot, status, externals, onSaved,
}: Params) => {
  const { saveSheets, isLoading } = useSaveSheetsAction();
  const {
    form: basicInfoForm, isDirty: isBasicInfoDirty,
    isLoading: isBasicInfoLoading, handleChange, samplingInfo, saveBasicInfo,
  } = useScheduleBasicInfo(
    {
      scheduleId,
      sampling: snapshot?.samplingData ?? null,
      tenant: snapshot?.tenant ?? null,
      team: snapshot?.team ?? null,
    });

  // 충돌 복구·원격 저장 동기화용 재조회. 값을 그 자리에서 대조해야 하므로 명령형이다.
  // 위젯의 조회와 같은 캐시를 쓰지만 구독이 아니라 1회 조회라, 재조회 로딩이
  // 입력 중인 폼의 isLoading 을 건드리지 않는다.
  const fetchSchedule = useFetchScheduleDetail();
  const confirm = useConfirm();
  const { user } = useAuth();

  const [sheets, setSheets] = useState<SheetForm[]>(
    () => hydrateSheets(snapshot?.samplingData?.sheets?.map(fromSheet) ?? [], buildGasSampleGroups(snapshot?.items ?? [])),
  );
  // 저장 기준선 — 마지막으로 서버에 반영된 상태를 카테고리별로 기록한다.
  const [baseline, setBaseline] = useState<SheetBaseline>(() => toSheetBaseline(sheets));
  // 서버에 저장된 적 있는 시트만 담는다. 신규 시트를 지운 것은 서버가 알 필요가 없다.
  const [deletedSheets, setDeletedSheets] = useState<SheetRef[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  // 미입력 필수 칸의 빨강 표시. 화면을 처음 열었을 때는 조용히 두고, 저장을 한 번 누른 뒤부터 켠다 —
  // 새 기록지를 열자마자 화면 전체가 빨개지면 경고가 무뎌진다.
  const [showMissing, setShowMissing] = useState(false);

  const activeSheet = sheets[activeIndex] ?? null;

  const {
    gasSampleGroups, assignedPollutants, unassignedGroups, unresolvedItems, sampleRules,
  } = useSheetRules({ snapshot, sheets, activeSheet });

  /**
   * 서버 시트를 폼으로 들일 때 가스상 표가 빈 기록지를 측정항목으로 채운다.
   *
   * **결과를 기준선에도 함께 반영한다.** 자동 채움은 규칙에서 결정적으로 재생성되므로 편집이
   * 아니라 화면 표현이다. 기준선에서 빠지면 사용자가 아무것도 입력하지 않았는데 미저장 변경으로
   * 잡혀 이탈 경고가 뜨고, 동시편집 병합에서 빈 자동 행이 dirty 로 잡혀 동료가 방금 저장한
   * 실측값을 이긴다. 저장하지 않고 나가도 다시 열면 같은 규칙으로 다시 채워지므로 잃는 것이 없다.
   */
  const hydrate = useCallback(
    (serverSheets: SamplingSheet[]) => hydrateSheets(serverSheets.map(fromSheet), gasSampleGroups),
    [gasSampleGroups],
  );

  // 저장 요청에 실을 시트 — 내가 실제로 바꾼 것만. 신규 시트는 기준선에 없으므로 항상 포함된다.
  const changedSheets = useMemo(() => getChangedSheets(sheets, baseline), [sheets, baseline]);
  const isSheetsDirty = changedSheets.length > 0 || deletedSheets.length > 0;

  // 활성 시트 입력에서 서버 계산값을 프론트에서 실시간으로 재현한 미리보기(effect 금지, 파생만).
  const previewCalc = useMemo<SheetCalcPreview | null>(
    () => (activeSheet ? calcSheetPreview(toSheetSave(activeSheet), externals) : null),
    [activeSheet, externals],
  );

  // 다른 사용자의 저장 병합 결과를 폼 상태에 반영한다. 병합 규칙과 알림은 동기화 훅이 갖는다.
  const applyRemoteResult = (result: RemoteSyncResult) => {
    setSheets(result.sheets);
    setBaseline(result.baseline);
    setActiveIndex((cur) => Math.min(cur, Math.max(result.sheets.length - 1, 0)));
  };

  const { updatedSections, clearUpdatedSections } = useRemoteSheetsSync({
    scheduleId, currentUsername: user?.username ?? null, fetchSchedule,
    sheets, baseline, deletedSheets, groups: gasSampleGroups, onApplied: applyRemoteResult,
  });

  const { recoverFromConflict, announceRecovered } = useSheetConflict({ scheduleId, fetchSchedule, confirm });

  const addSheet = (category: MeasurementCategory) => {
    // 기록지는 카테고리당 한 장 — 기준선·삭제 목록이 카테고리를 키로 쓰므로 두 장이면 깨진다.
    if (sheets.some((sheet) => sheet.category === category)) return;
    // 측정점 수는 굴뚝 치수 기반 규정 요구수로 자동 생성(치수 미입력이면 1개). 수동 조정 가능.
    const pointCount = calcRequiredPointCount(externals) ?? 1;
    // 새 기록지의 가스상 표도 측정항목으로 채운다. 아직 어느 기록지에도 없는 것만 들어간다.
    setSheets((prev) => hydrateSheets([...prev, getDefaultSheetForm(category, pointCount)], gasSampleGroups));
    // 같은 카테고리를 지웠다가 다시 추가한 것은 삭제가 아니라 교체다.
    setDeletedSheets((prev) => prev.filter((ref) => ref.category !== category));
    setActiveIndex(sheets.length);
  };

  const removeSheet = (index: number) => {
    const removed = sheets[index];
    if (!removed) return;

    setSheets((prev) => prev.filter((_, i) => i !== index));
    // 서버는 "요청에서 빠진 시트"를 삭제로 해석하지 않으므로 삭제는 따로 알려야 한다.
    if (removed.version !== null) {
      const ref: SheetRef = { category: removed.category, version: removed.version };
      setDeletedSheets((prev) => [...prev.filter((r) => r.category !== removed.category), ref]);
    }
    setActiveIndex((cur) => (cur >= index && cur > 0 ? cur - 1 : cur));
  };

  const updateActiveSheet = (updater: (sheet: SheetForm) => SheetForm) => {
    setSheets((prev) => prev.map((s, i) => (i === activeIndex ? updater(s) : s)));
  };

  // 409 복구 — 사용자가 되돌리기로 하면 그 기록지만 서버 값으로 바꾸고 기준선·삭제 요청을 맞춘다.
  const applyConflictRecovery = async (message: string) => {
    const recovery = await recoverFromConflict(message, {
      sheets, deletedSheets, changedCategories: changedSheets.map((sheet) => sheet.category), groups: gasSampleGroups,
    });
    if (!recovery) return;   // 저장되지 않은 채로 남는다 — 값을 직접 옮겨 적을 수 있게.

    const { sheets: next, categories } = recovery;
    setSheets(next);
    // 되돌린 기록지는 서버 값과 같아졌으므로 기준선도 함께 옮긴다.
    // 그러지 않으면 다음 저장에서 "내가 바꾼 기록지"로 잡혀 애먼 version 이 올라간다.
    setBaseline((prev) => ({
      ...prev,
      ...toSheetBaseline(next.filter((sheet) => categories.includes(sheet.category))),
    }));
    // 되돌린 카테고리의 삭제 요청은 취소된다 — 다른 사용자가 그 기록지를 쓰고 있다는 뜻이다.
    setDeletedSheets((prev) => prev.filter((ref) => !categories.includes(ref.category)));
    setActiveIndex((cur) => Math.min(cur, Math.max(next.length - 1, 0)));
    announceRecovered(categories);
  };

  // 저장 본체 — 검증 → 공통정보 → 시트 → 서버 계산결과 재동기화.
  // "측정 데이터 저장"과 "저장 후 채취기록지 다운로드" 두 진입점이 공유한다(로직 중복 방지).
  // 성공 toast는 호출부가 낸다 — 다운로드 경로에서 저장·다운로드 toast가 겹치지 않도록.
  const runSave = async (): Promise<SaveResult> => {
    if (scheduleId == null) return { ok: false };

    const errors = sheets.flatMap(validateSheetFields);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return { ok: false };
    }

    // 흡습병 무게차가 법정 허용 범위를 벗어난 기록지 — 화면의 경고는 활성 기록지만 비추므로
    // 다른 탭에 열어 둔 기록지는 여기서만 드러난다. 실제로 잰 값은 남겨야 하므로 막지는 않는다.
    const moistureIssues = describeMoistureWeightIssues(sheets);
    if (moistureIssues.total > 0) {
      const isConfirmed = await confirm({
        title: "흡습병 무게차가 법정 허용 범위를 벗어났습니다",
        description: `${moistureIssues.description}

범위를 벗어난 채취는 수분량 산정 근거로 쓸 수 없습니다. 이대로 저장할까요?`,
        confirmLabel: "이대로 저장",
        cancelLabel: "돌아가서 확인",
      });
      if (!isConfirmed) return { ok: false };
    }

    // 필수 미입력은 저장을 막지 않는다 — 현장에서 나중에 채우는 흐름이 정상이기 때문이다.
    // 대신 이 시점부터 빈 칸을 화면에 켜고, 규모를 알린 뒤 한 번만 확인받는다.
    setShowMissing(true);
    const missing = describeMissingRequired(sheets, assignedPollutants);
    if (missing.total > 0) {
      const isConfirmed = await confirm({
        title: "미입력 필수 항목이 있습니다",
        description: `${missing.description}

이대로 저장할까요? 빈 칸은 화면에 표시해 두었습니다.`,
        confirmLabel: "이대로 저장",
        cancelLabel: "돌아가서 입력",
      });
      if (!isConfirmed) return { ok: false };
    }

    const previousStatus = status;

    try {
      // 바꾼 기록지만 보낸다 — 손대지 않은 기록지까지 보내면 서버가 그 version 도 올려
      // 다음 사람의 저장이 애먼 기록지에서 충돌한다. 요청에 없는 기록지는 서버가 그대로 둔다.
      // 채취 시각·현장 담당자는 같은 스냅샷 노드·같은 화면 소유라 이 요청에 함께 실린다.
      const savedDetail = await saveSheets(
        scheduleId, samplingInfo, changedSheets.map(toSheetSave), deletedSheets);

      // 남은 공통 정보(서명란 담당자·측정자 표기)는 소유 노드가 달라 각자의 경로로 간다.
      // 시트 저장 뒤에 보내야 "시트는 실패했는데 담당자만 저장됨"이 생기지 않는다.
      const detail = await saveBasicInfo(savedDetail);
      // 서버 계산결과가 반영된 최신 시트로 폼을 동기화하고 기준선도 함께 옮긴다.
      const saved = hydrate(detail.snapshot.samplingData?.sheets ?? []);
      setSheets(saved);
      setBaseline(toSheetBaseline(saved));
      setDeletedSheets([]);
      // 내 저장으로 화면이 최신이 됐으니 "다른 사용자가 갱신함" 강조는 의미를 잃는다.
      clearUpdatedSections();
      onSaved?.();

      // 상태 전이는 서버가 판단하므로(시트 최초 저장 → 측정중 등) 저장 전후 값을 비교해 알아낸다.
      const advancedTo = previousStatus !== null && detail.status !== previousStatus ? detail.status : null;
      return { ok: true, advancedTo };
    } catch (err) {
      // 충돌은 다시 눌러서 풀리지 않는다 — 무엇이 어긋났는지 보여주고 사용자가 정하게 한다.
      if (err instanceof ApiError && err.isConflict) {
        await applyConflictRecovery(err.message);
        return { ok: false };
      }

      toast.error(err instanceof Error ? err.message : ERROR_MESSAGE.UPDATE);
      return { ok: false };
    }
  };

  const handleSave = async (): Promise<void> => {
    const result = await runSave();
    if (!result.ok) return;

    toast.success(
      result.advancedTo
        ? `측정 데이터가 저장되었습니다. 상태가 '${SCHEDULE_STATUS_LABEL[result.advancedTo]}'(으)로 변경되었습니다.`
        : "측정 데이터가 저장되었습니다.",
    );
  };

  // 다운로드 시나리오는 저장 경로를 그대로 재사용한다(runSave 주입).
  const samplingRecordsExport = useExportSamplingRecords({
    scheduleId,
    saveBeforeExport: async () => (await runSave()).ok,
  });

  return {
    sheets,
    activeIndex,
    activeSheet,
    previewCalc,
    // 저장 버튼 강조용 — 시트·공통정보 어느 쪽이든 미저장 변경이 있으면 true.
    isDirty: isSheetsDirty || isBasicInfoDirty,
    // 다운로드 진행 중에도 저장 버튼이 잠기도록 합성한다.
    isLoading: isLoading || isBasicInfoLoading || samplingRecordsExport.isExporting,
    basicInfoForm: basicInfoForm,
    // 다른 사용자의 저장으로 방금 갱신된 섹션(카테고리별). 화면에서 강조하는 데 쓴다.
    updatedSections,
    // 이 측정계획에 배정된 THC·NOx·SOx — 필수 칸 판정의 기준이다.
    assignedPollutants,
    // 가스상 표에서 아직 적히지 않은 항목과, 자동으로 만들 수 없는 항목.
    unassignedGroups,
    unresolvedItems,
    // 가스상 행의 파생 규칙 — 등속흡인 행 잠금과 시작시각 입력 시 종료시각 채우기의 근거.
    sampleRules,
    // 저장을 한 번 눌렀는가 — 미입력 필수 칸의 빨강 표시를 켜는 스위치.
    showMissing,

    handleBasicInfoChange: handleChange,
    setActiveIndex,
    addSheet,
    removeSheet,
    updateActiveSheet,
    handleSave,

    // 채취기록지 다운로드
    isExportDialogOpen: samplingRecordsExport.isDialogOpen,
    samplingRecordTemplate: samplingRecordsExport.template,
    isExporting: samplingRecordsExport.isExporting,
    setExportDialogOpen: samplingRecordsExport.setIsDialogOpen,
    handleExport: samplingRecordsExport.handleExport,
  };
};
