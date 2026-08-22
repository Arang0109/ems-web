import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  ScheduleSnapshot, SheetCalcPreview, SheetCalcExternals, SheetRef, SheetsSavedEvent,
} from "@entities/schedule";
import {
  calcSheetPreview, calcRequiredPointCount, subscribeScheduleStream,
  useSaveSheetsAction, useScheduleDetail,
} from "@entities/schedule";
import { useAuth } from "@entities/auth";
import { ApiError } from "@shared/api";
import type { MeasurementCategory, ScheduleStatus } from "@shared/model";
import { SCHEDULE_STATUS_LABEL, MEASUREMENT_CATEGORY_LABEL, ERROR_MESSAGE } from "@shared/config";
import { useConfirm } from "@shared/ui/dialogs";
import { toast } from "@shared/ui/toasts";

import type { SheetForm } from "../types";
import { getDefaultSheetForm } from "../types";
import { toSheetSave, fromSheet } from "../mapper";
import { validateSheetFields } from "../validator";
import type { UpdatedSections } from "../remote-sync";
import { applyRemoteSheets } from "../remote-sync";
import type { SheetBaseline } from "../conflict";
import {
  describeSheetDiff, diffSheetVersions, getChangedSheets, getResolvableCategories,
  resolveWithServer, toSheetBaseline,
} from "../conflict";
import { useScheduleBasicInfo } from "./use-schedule-basic-info";
import { useExportSamplingRecords } from "./use-export-sampling-records";

interface Params {
  scheduleId: number | null;
  snapshot: ScheduleSnapshot | null;
  externals: SheetCalcExternals;
  onSaved?: () => void;
}

// 저장 결과. 서버가 상태를 전진시켰으면(시트 최초 저장·시료접수일 최초 입력) advancedTo에 새 상태가 담긴다.
type SaveResult = { ok: false } | { ok: true; advancedTo: ScheduleStatus | null };

/** 갱신 강조를 유지하는 시간(ms). 눈에 들어올 만큼은 남기되 화면에 계속 붙어 있지는 않게. */
const UPDATED_HIGHLIGHT_MS = 8_000;


// 측정계획의 전체 시트 세트를 관리한다. 저장은 시트 세트를 한 번에 보내지만 서버는 요청에 담긴
// 카테고리만 교체하므로(나머지는 보관본 유지), 삭제는 deletedSheets 로 명시해 보낸다.
// 계산값 표시는 previewCalc(서버 파이프라인 풀 미러링)가 담당한다 — 저장 후에도 폼 값에서 동일하게 재현된다.
export const useSaveSheets = ({
  scheduleId, snapshot, externals, onSaved,
}: Params) => {
  const { saveSheets, isLoading } = useSaveSheetsAction();
  const {
    form: basicInfoForm, isDirty: isBasicInfoDirty,
    isLoading: isBasicInfoLoading, handleChange, saveBasicInfo,
  } = useScheduleBasicInfo(
    {
      scheduleId,
      basicInfo: snapshot?.basicInfo ?? null,
      team: snapshot?.team ?? null
    });

  // 충돌 복구 전용 재조회. 화면 트리를 소유한 위젯의 조회와 인스턴스를 나눠야
  // 재조회 로딩이 입력 중인 폼을 건드리지 않는다.
  const { fetchSchedule } = useScheduleDetail();
  const confirm = useConfirm();
  // 내 저장이 알림으로 되돌아온 메아리를 걸러내는 데 쓴다.
  const { user } = useAuth();
  const currentUsername = user?.username ?? null;

  const [sheets, setSheets] = useState<SheetForm[]>(() => snapshot?.sheets.map(fromSheet) ?? []);
  // 저장 기준선 — 마지막으로 서버에 반영된 상태를 카테고리별로 기록한다.
  const [baseline, setBaseline] = useState<SheetBaseline>(() => toSheetBaseline(sheets));
  // 서버에 저장된 적 있는 시트만 담는다. 신규 시트를 지운 것은 서버가 알 필요가 없다.
  const [deletedSheets, setDeletedSheets] = useState<SheetRef[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  // 다른 사용자의 저장으로 방금 갱신된 섹션 — 화면에서 어디가 바뀌었는지 짚어준다.
  const [updatedSections, setUpdatedSections] = useState<UpdatedSections>({});

  // 실시간 수신 콜백에서 최신 폼 상태를 읽기 위한 참조. 이 값들을 구독 의존성에 넣으면
  // 글자를 칠 때마다 스트림이 끊겼다 다시 붙는다.
  const sheetsRef = useRef(sheets);
  const baselineRef = useRef(baseline);
  const deletedRef = useRef(deletedSheets);
  // 동기화 세대 — 응답이 순서를 지키지 않아도 마지막 것만 반영하기 위한 표식.
  const syncSeqRef = useRef(0);

  // 렌더 중에 ref 를 건드리지 않는다. 수신 콜백은 커밋 이후 비동기로 도는 경로라 여기서 맞춰도 늦지 않다.
  useEffect(() => {
    sheetsRef.current = sheets;
    baselineRef.current = baseline;
    deletedRef.current = deletedSheets;
  });

  // 저장 요청에 실을 시트 — 내가 실제로 바꾼 것만. 신규 시트는 기준선에 없으므로 항상 포함된다.
  const changedSheets = useMemo(() => getChangedSheets(sheets, baseline), [sheets, baseline]);

  const isSheetsDirty = changedSheets.length > 0 || deletedSheets.length > 0;

  const activeSheet = sheets[activeIndex] ?? null;

  // 활성 시트 입력에서 서버 계산값을 프론트에서 실시간으로 재현한 미리보기(effect 금지, 파생만).
  const previewCalc = useMemo<SheetCalcPreview | null>(
    () => (activeSheet ? calcSheetPreview(toSheetSave(activeSheet), externals) : null),
    [activeSheet, externals],
  );

  const addSheet = (category: MeasurementCategory) => {
    // 측정점 수는 굴뚝 치수 기반 규정 요구수로 자동 생성(치수 미입력이면 1개). 수동 조정 가능.
    const pointCount = calcRequiredPointCount(externals) ?? 1;
    setSheets((prev) => [...prev, getDefaultSheetForm(category, pointCount)]);
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

  /**
   * 다른 사용자의 저장을 화면에 반영한다. 병합 규칙은 {@link applyRemoteSheets} 에 있다 —
   * 내가 편집 중인 블록만 지키고 나머지는 서버 값을 따르며, 시트 version 도 함께 이어받는다.
   *
   * 알림에 시트 본문을 싣지 않고 여기서 다시 조회하는 이유는, 조회 결과가 늘 진실의 원천이기
   * 때문이다 — 알림이 유실되거나 순서가 뒤바뀌어도 화면은 서버 상태로 수렴한다.
   */
  const applyRemoteSave = useCallback(async (event: SheetsSavedEvent) => {
    if (scheduleId == null) return;
    // 내 저장이 돌아온 메아리다. 이미 최신 상태이므로 재조회할 필요가 없다.
    if (event.editor.username === currentUsername) return;

    // 저장이 연달아 오면 응답이 뒤바뀔 수 있다. 뒤늦게 도착한 옛 조회로 화면을 되돌리면
    // 그 낡은 version 으로 저장하게 되어 애먼 409 가 난다. 마지막 동기화만 반영한다.
    const seq = syncSeqRef.current + 1;
    syncSeqRef.current = seq;

    const latest = await fetchSchedule(scheduleId);
    if (!latest || seq !== syncSeqRef.current) return;

    const result = applyRemoteSheets(
      sheetsRef.current, baselineRef.current, deletedRef.current, latest.snapshot.sheets,
    );

    if (result.changed) {
      setSheets(result.sheets);
      setBaseline(result.baseline);
      setActiveIndex((cur) => Math.min(cur, Math.max(result.sheets.length - 1, 0)));
      setUpdatedSections(result.updatedSections);
    }

    // 이번 저장이 건드린 기록지에 한해 알린다 — 예전에 생긴 충돌을 매 저장마다 다시 알리지 않도록.
    const conflicted = result.conflictingCategories.filter((c) => event.categories.includes(c));
    if (conflicted.length > 0) {
      const labels = conflicted.map((category) => MEASUREMENT_CATEGORY_LABEL[category]).join("·");
      toast.warning(
        `${event.editor.name}님이 ${labels} 기록지의 같은 항목을 수정했습니다. `
        + "저장할 때 어느 값을 남길지 확인하게 됩니다.",
      );
      return;
    }

    // 눈에 보이는 변화가 없으면(version 만 이어받은 경우) 굳이 알리지 않는다.
    if (result.touchedCategories.length === 0) return;

    const labels = result.touchedCategories
      .map((category) => MEASUREMENT_CATEGORY_LABEL[category]).join("·");
    toast.info(`${event.editor.name}님이 ${labels} 기록지를 저장했습니다. 최신 내용으로 맞췄습니다.`);
  }, [scheduleId, currentUsername, fetchSchedule]);

  // 같은 측정계획을 열어둔 다른 사용자의 저장을 구독한다.
  useEffect(() => {
    if (scheduleId == null) return;
    return subscribeScheduleStream(scheduleId, {
      onSheetsSaved: (event) => { void applyRemoteSave(event); },
    });
  }, [scheduleId, applyRemoteSave]);

  // 강조는 잠깐만 남긴다. 갱신이 연달아 오면 마지막 것 기준으로 타이머가 다시 시작된다.
  useEffect(() => {
    if (Object.keys(updatedSections).length === 0) return;

    const timer = setTimeout(() => setUpdatedSections({}), UPDATED_HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [updatedSections]);

  /**
   * 저장이 409로 거부됐을 때의 복구 경로. 서버 최신본을 받아 무엇이 어긋났는지 가려내고,
   * 어긋난 기록지만 최신 내용으로 되돌릴지 사용자에게 묻는다.
   *
   * 되돌리면 그 기록지에 입력한 내 값은 사라지지만 **나머지 기록지의 입력은 남는다** —
   * 시트에 식별자가 없어 자동 병합이 불가능하므로, 잃는 범위를 최소화하고 무엇을 잃는지
   * 미리 밝히는 것이 여기서 할 수 있는 최선이다. 강제 덮어쓰기는 제공하지 않는다.
   */
  const recoverFromConflict = async (message: string) => {
    if (scheduleId == null) return;

    const latest = await fetchSchedule(scheduleId);
    if (!latest) {
      toast.error(message);
      return;
    }

    const serverSheets = latest.snapshot.sheets;
    const diff = diffSheetVersions(
      sheets, serverSheets, deletedSheets, changedSheets.map((sheet) => sheet.category),
    );
    const categories = getResolvableCategories(diff);

    // 기록지 내용은 그대로인데 저장이 물리적으로 겹친 경우다. 되돌릴 것이 없으니 다시 저장하면 된다.
    if (categories.length === 0) {
      toast.error(message);
      return;
    }

    const isConfirmed = await confirm({
      title: "다른 사용자가 먼저 저장했습니다",
      description: describeSheetDiff(diff),
      confirmLabel: "변경된 내용으로 덮어쓰기(내 입력값 사라짐)",
      cancelLabel: "내 입력 유지",
      // 되돌려도 잃을 값이 없으면 경고 톤을 쓰지 않는다 — 매번 붉게 물으면 경고가 무뎌진다.
      tone: diff.conflicted.length > 0 ? "danger" : "default",
    });
    if (!isConfirmed) return;   // 저장되지 않은 채로 남는다 — 값을 직접 옮겨 적을 수 있게.

    const next = resolveWithServer(sheets, serverSheets, categories);
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

    const labels = categories.map((category) => MEASUREMENT_CATEGORY_LABEL[category]).join("·");
    toast.success(`${labels} 기록지를 최신 내용으로 되돌렸습니다. 이어서 저장할 수 있습니다.`);
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

    const previousStatus = snapshot?.status ?? null;

    try {
      // 공통 정보(채취시간·담당자)를 먼저 반영한다. 실패하면 시트는 건드리지 않아
      // "시트만 저장되고 공통 정보는 실패"하는 부분 성공 상태가 생기지 않는다.
      await saveBasicInfo();

      // 바꾼 기록지만 보낸다 — 손대지 않은 기록지까지 보내면 서버가 그 version 도 올려
      // 다음 사람의 저장이 애먼 기록지에서 충돌한다. 요청에 없는 기록지는 서버가 그대로 둔다.
      const detail = await saveSheets(scheduleId, changedSheets.map(toSheetSave), deletedSheets);
      // 서버 계산결과가 반영된 최신 시트로 폼을 동기화하고 기준선도 함께 옮긴다.
      const saved = detail.snapshot.sheets.map(fromSheet);
      setSheets(saved);
      setBaseline(toSheetBaseline(saved));
      setDeletedSheets([]);
      // 내 저장으로 화면이 최신이 됐으니 "다른 사용자가 갱신함" 강조는 의미를 잃는다.
      setUpdatedSections({});
      onSaved?.();

      // 상태 전이는 서버가 판단하므로(시트 최초 저장 → 측정중 등) 저장 전후 값을 비교해 알아낸다.
      const advancedTo = previousStatus !== null && detail.status !== previousStatus ? detail.status : null;
      return { ok: true, advancedTo };
    } catch (err) {
      // 충돌은 다시 눌러서 풀리지 않는다 — 무엇이 어긋났는지 보여주고 사용자가 정하게 한다.
      if (err instanceof ApiError && err.isConflict) {
        await recoverFromConflict(err.message);
        return { ok: false };
      }

      toast.error(err instanceof Error ? err.message : ERROR_MESSAGE.UPDATE);
      return { ok: false };
    }
  };

  const handleSave = async () => {
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
