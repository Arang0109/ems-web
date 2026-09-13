import { useCallback, useEffect, useRef, useState } from "react";

import type {
  AnalysisResult, MeasurementItemSnapshot, SamplingSheet,
} from "@entities/schedule";
import {
  useScheduleAnalyses, useFetchScheduleAnalyses,
  useSaveAnalysisResultsAction, useSaveSamplingTimesAction,
} from "@entities/schedule";

import { useConfirm } from "@shared/ui/dialogs";
import { toast } from "@shared/ui/toasts";

import { toAnalysisResultsSave, toAnalysisRows, toSamplingTimesSave } from "../mapper";
import {
  hasAnalysisInput, hasSamplingTime, isResultChanged, isSamplingTimeChanged,
  type AnalysisRowForm,
} from "../types";
import { validateAnalysisRows } from "../validator";
import {
  applySamplingTimes, collectSamplingTimes, countAmbiguousPollutants, countSamplingTimeChanges,
} from "../sampling-times";

interface Params {
  scheduleId: number | null;
  items: MeasurementItemSnapshot[];
  /** 현장 기록지 — 통칭 시료 행의 채취시각을 항목별로 펴 오는 데 쓴다 */
  sheets: SamplingSheet[];
  /** 저장 후 상위(측정계획 상세)를 재조회해 상태 배지·완료 버튼을 갱신한다. */
  onSaved?: () => void;
}

/**
 * 항목별 실험분석정보 입력 — 채취시각과 실험실 입력값을 한 표에서 함께 다룬다.
 *
 * 행은 계획의 측정항목에서 만들고 저장된 분석 결과를 덮어 채운다. 저장은 한 번의 호출로 여러 행을
 * 보내며, 서버가 측정물질을 키로 upsert 한다.
 *
 * <b>분석 결과는 바뀐 행만 보낸다.</b> 빈 행에도 측정항목 원장의 분석방법·장비가 초기값으로
 * 들어 있어, 표 전체를 보내면 손대지 않은 항목까지 서버에 기록이 생긴다 — 새 회차를 열자마자
 * 이전 회차와 똑같은 값이 저장돼 있는 것처럼 보이게 된다.
 * 채취시각은 초기값이 없어 표 전체를 보내도 서버가 빈 행을 건너뛴다.
 *
 * 행을 더하거나 지우는 조작은 없다. 분석 결과가 계획 문서의 측정항목 안에 저장되므로
 * 행 목록이 곧 측정항목 목록이고, 항목을 더하고 빼는 일은 측정정보 탭이 맡는다.
 * 잘못 넣은 결과는 칸을 비우고 저장해 지운다 — 서버가 빈 값을 "지웠다"로 읽는다.
 *
 * <b>한 행이지만 저장 경로는 둘이다.</b> 서버가 채취시각과 실험실 입력값의 소유를
 * `PUT .../sampling-times` 와 `PUT .../results` 로 나눠 두었다(서로의 필드를 덮어쓰지 않는다).
 * 그래서 기준선과 대조해 <b>실제로 바뀐 경로만</b> 호출한다 — 손대지 않은 쪽까지 보내면
 * 그 요청의 실패가 사용자가 하지도 않은 변경 탓으로 보인다.
 *
 */
export const useScheduleAnalysis = ({ scheduleId, items, sheets, onSaved }: Params) => {
  const confirm = useConfirm();
  // 로딩·에러는 구독형 쿼리에서, 저장 직후의 즉시 반영은 명령형 조회에서 온다.
  // 둘은 같은 캐시를 보므로 요청이 중복되지 않는다.
  const { data: analyses, isLoading: isFetching, error } = useScheduleAnalyses(scheduleId);
  const fetchAnalyses = useFetchScheduleAnalyses();
  const { saveAnalysisResults, isLoading: isSaving } = useSaveAnalysisResultsAction();
  const { saveSamplingTimes, isLoading: isSavingTimes } = useSaveSamplingTimesAction();

  const [rows, setRows] = useState<AnalysisRowForm[]>([]);
  const [baselineRows, setBaselineRows] = useState<AnalysisRowForm[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});

  // 측정항목이 바뀌면(측정정보 탭에서 항목 교체) 행 구성 자체가 달라지므로 다시 만든다.
  const itemsKey = items.map((item) => item.pollutantId).join(",");

  // 행을 만들 때 읽는 스냅샷은 늘 최신이어야 한다. itemsKey 로만 갱신되는 클로저에 items 를
  // 가두면, 측정항목 구성이 같은 다음 회차로 옮겼을 때 itemsKey 가 그대로라 이전 계획 스냅샷의
  // 허용기준·산소보정으로 행이 만들어진다.
  // 아래 로딩 이펙트보다 먼저 선언해 둔다 — 이펙트는 선언 순서로 실행되고, 행을 만드는
  // `applyRecords` 는 응답이 온 뒤에야 불리므로 그 시점엔 최신 스냅샷이 들어와 있다.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // 서버 값을 폼과 기준선에 동시에 앉힌다. 기준선이 있어야 "바뀐 행만 저장"이 성립한다.
  const applyResults = useCallback((results: AnalysisResult[]) => {
    const next = toAnalysisRows(itemsRef.current, results);
    setRows(next);
    setBaselineRows(next);
    setFieldErrors({});
    // itemsKey 는 값을 읽으려는 의존이 아니라 로딩 이펙트를 다시 태우기 위한 것이다 —
    // 스냅샷 객체를 그대로 넣으면 재조회마다 새 참조라 무한 루프가 된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  // 저장·삭제 뒤 서버 값으로 되맞추는 경로. 화면 갱신을 기다려야 하므로 await 가능한 형태로 둔다.
  // 조회가 캐시를 갱신하면 아래 이펙트가 폼과 기준선에 앉힌다.
  const load = useCallback(async () => {
    if (scheduleId == null) return;
    await fetchAnalyses(scheduleId);
  }, [scheduleId, fetchAnalyses]);

  // 서버 값이 도착하거나 갱신되면 폼에 반영한다. 늦게 도착한 이전 계획의 응답을 버리는 일은
  // 쿼리 캐시가 맡는다 — `analyses` 는 언제나 현재 `scheduleId` 의 값이다.
  useEffect(() => {
    applyResults(analyses);
  }, [analyses, applyResults]);

  // 검증 대상은 실험실 입력값이 바뀐 행뿐이다 — 채취시각만 고친 행까지 넘기면
  // 분석값을 아직 넣지 않았다는 이유로 시각 저장이 막힌다.
  const resultDirtyRows = rows.filter((row, index) => isResultChanged(row, baselineRows[index]));
  const isTimeDirty = rows.some((row, index) => isSamplingTimeChanged(row, baselineRows[index]));
  const isDirty = resultDirtyRows.length > 0 || isTimeDirty;

  // 진행도는 "분석값이 들어온 항목 수"다. 분석 결과 유무로 세면 채취시각만 적은 항목까지
  // 완료로 잡혀, 실험실 입력이 하나도 없는 계획이 100% 로 보인다.
  const filledCount = rows.filter(hasAnalysisInput).length;
  const timeFilledCount = rows.filter(hasSamplingTime).length;

  /**
   * 현장 기록지의 채취시각을 표로 가져온다.
   *
   * 통칭 시료 한 행이 여러 항목으로 펴진다 — `VOCs` 09:00~10:00 은 포름알데히드·아세트알데히드
   * 두 행에 같은 시각으로 들어간다. 근거는 시료 행의 `pollutantIds` 이며, 그것이 없는
   * 옛 기록지·수동 행은 가져올 것이 없다.
   *
   * 덮어쓰기이므로 무엇이 바뀌는지 먼저 밝히고 확인받는다.
   */
  const importSamplingTimes = async () => {
    const times = collectSamplingTimes(sheets);
    const changes = countSamplingTimeChanges(rows, times);

    if (changes === 0) {
      toast.info(
        times.size === 0
          ? "기록지에서 가져올 채취시각이 없습니다. 가스상 물질 표에 채취시각을 먼저 입력하세요."
          : "기록지의 채취시각이 이미 표에 반영돼 있습니다.",
      );
      return;
    }

    const ambiguous = countAmbiguousPollutants(sheets);
    const isConfirmed = await confirm({
      title: "기록지의 채취시각을 가져올까요?",
      description: `${changes}개 항목의 채취시각이 기록지 값으로 바뀝니다.`
        + (ambiguous > 0
          ? `

${ambiguous}개 항목은 여러 기록지에 서로 다른 시각으로 적혀 있어 먼저 적힌 기록지의 값을 씁니다.`
          : ""),
      confirmLabel: "가져오기",
      cancelLabel: "취소",
    });
    if (!isConfirmed) return;

    setRows((prev) => applySamplingTimes(prev, times));
    toast.success(`${changes}개 항목의 채취시각을 가져왔습니다. 저장해야 반영됩니다.`);
  };

  const handleChange = (pollutantId: number, patch: Partial<AnalysisRowForm>) => {
    setRows((prev) =>
      prev.map((row) => (row.pollutantId === pollutantId ? { ...row, ...patch } : row)));
    setFieldErrors((prev) => ({ ...prev, [pollutantId]: "" }));
  };

  const handleSave = async () => {
    if (scheduleId == null || !isDirty) return;

    const errors = validateAnalysisRows(resultDirtyRows);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // 채취시각을 먼저 보낸다. 둘 다 바뀐 상태에서 뒤 요청이 실패하면 앞 요청은 이미 반영된
    // 상태로 남는데, 그 사실은 곧바로 이어지는 재조회가 화면에 드러낸다.
    const steps: { label: string; run: () => Promise<unknown> }[] = [];
    if (isTimeDirty) {
      // 표 전체를 보낸다 — 비운 칸도 "지웠다"로 전달돼야 서버에서 시각이 실제로 비워진다.
      steps.push({ label: "채취시간", run: () => saveSamplingTimes(scheduleId, toSamplingTimesSave(rows)) });
    }
    if (resultDirtyRows.length > 0) {
      // 채취시각과 달리 <b>바뀐 행만</b> 보낸다. 빈 행에도 측정항목 원장의 분석방법·장비가
      // 초기값으로 들어 있어(`toEmptyRow`), 표 전체를 보내면 서버의 "값이 다 비었으면 건너뛴다"
      // 판정에 걸리지 않는다 — 한 항목만 입력해도 나머지 항목까지 원장 값 그대로 기록이 생긴다.
      // 서버는 요청에 없는 항목을 손대지 않으므로 이렇게 좁혀도 "비운 칸 = 지웠다"는 유지된다.
      steps.push({
        label: "분석 결과",
        run: () => saveAnalysisResults(scheduleId, toAnalysisResultsSave(resultDirtyRows)),
      });
    }

    try {
      for (const step of steps) await step.run();
      toast.success("실험분석정보를 저장했습니다.");
      await load();
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "저장에 실패했습니다.");
      // 어디까지 반영됐는지 서버 값으로 맞춘다.
      await load();
    }
  };

  return {
    rows,
    fieldErrors,
    isDirty,
    filledCount,
    timeFilledCount,
    isLoading: isFetching || isSaving || isSavingTimes,
    error,
    handleChange,
    handleSave,
    importSamplingTimes,
  };
};
