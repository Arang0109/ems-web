import type { AnalysisResult, MeasurementItemSnapshot } from "@entities/schedule";
import { formatTime } from "@shared/lib";
import { toMeasurementUnit, type MeasurementUnit } from "@shared/model";

/**
 * 항목별 실험분석 입력 행.
 *
 * 행의 출처는 <b>계획의 측정항목 스냅샷</b>이다 — 분석 기록이 아직 없는 항목도 빈 행으로 보여야
 * "무엇이 남았는지"가 화면에서 드러난다. 기록이 있는 항목만 나열하면 미입력 항목이 사라진다.
 *
 * `allowance`·`oxygenApplicable`은 측정 시점 원장 사본이라 읽기 전용이며, 입력 대상은
 * 채취시각 둘과 분석값·단위·분석방법·분석장비 넷이다.
 *
 * <b>채취시각과 분석값은 한 행의 다른 칸일 뿐이지만 저장 경로가 갈라진다</b> —
 * 서버가 `PUT .../results` 와 `PUT .../sampling-times` 로 필드 소유를 나눠 두었기 때문이다.
 * 어느 쪽이 바뀌었는지는 훅이 기준선과 대조해 판정하고, 바뀐 경로만 호출한다.
 */
export type AnalysisRowForm = {
  pollutantId: number;
  /**
   * 서버 기록에 <b>분석값이</b> 들어 있는지. "분석 결과가 있다"로 갈음할 수 없다 —
   * 채취시각만 저장된 항목도 있으므로, 그것으로 "저장된 값을 비웠다"를 판정하면
   * 분석값을 한 번도 넣지 않은 행이 오류로 잡힌다.
   */
  hasSavedValue: boolean;
  pollutantName: string;
  allowance: number | null;
  oxygenApplicable: boolean;

  /** "HH:mm" — 빈 문자열은 미작성. 저장 시 `unformatTime` 으로 서버 형식("HH:mm:ss")이 된다 */
  samplingStartedAt: string;
  samplingEndedAt: string;

  analysisValue: string;      // 숫자량이지만 Form 레이어이므로 string
  /** 정해진 단위 중 하나. `""` 는 미선택이다 — 서버 계약은 자유 문자열이지만 입력은 Select 로 받는다 */
  unit: MeasurementUnit | "";
  analysisMethod: string;
  analysisEquipment: string;
};

/** 분석 진행 정보 — 성적서 진행 일자(PATCH report-dates)와 서명란 담당자(PATCH tenant)를 함께 담는다. */
export type AnalysisProgressForm = {
  receivedAt: string;         // "yyyy-MM-dd" — 입력되면 서버가 '분석값입력중'으로 전진시킨다
  analyzedAt: string;
  issuedAt: string;
  analyst: string;            // 시료분석검사자
  technicalManager: string;   // 기술책임자
};

export const getDefaultAnalysisProgressForm = (): AnalysisProgressForm => ({
  receivedAt: "", analyzedAt: "", issuedAt: "", analyst: "", technicalManager: "",
});

/** 행에 분석값이 있는지 — 저장 대상 판정과 진행도에 쓴다. */
export const hasAnalysisInput = (row: AnalysisRowForm): boolean =>
  row.analysisValue.trim() !== "";

/** 행에 채취시각이 하나라도 있는지 — 진행도 표시에 쓴다. */
export const hasSamplingTime = (row: AnalysisRowForm): boolean =>
  row.samplingStartedAt !== "" || row.samplingEndedAt !== "";

/**
 * 실험실 입력값 네 칸 중 하나라도 기준선과 다르면 `results` 저장 대상이다.
 *
 * <b>기준선과의 대조로만 판정한다.</b> "칸이 채워졌는가"로 보면 아래 `toEmptyRow` 가 원장에서
 * 받아 넣은 분석방법·장비 때문에 손대지 않은 행까지 저장 대상이 되어, 새 회차에 이전 회차와
 * 똑같은 기록이 생긴다.
 */
export const isResultChanged = (
  row: AnalysisRowForm, baseline: AnalysisRowForm | undefined,
): boolean => {
  if (!baseline) return hasAnalysisInput(row);
  return row.analysisValue !== baseline.analysisValue
    || row.unit !== baseline.unit
    || row.analysisMethod !== baseline.analysisMethod
    || row.analysisEquipment !== baseline.analysisEquipment;
};

/** 채취시각 두 칸 중 하나라도 기준선과 다르면 `sampling-times` 저장 대상이다. */
export const isSamplingTimeChanged = (
  row: AnalysisRowForm, baseline: AnalysisRowForm | undefined,
): boolean => {
  if (!baseline) return hasSamplingTime(row);
  return row.samplingStartedAt !== baseline.samplingStartedAt
    || row.samplingEndedAt !== baseline.samplingEndedAt;
};

/** 스냅샷 측정항목만으로 만든 빈 행(아직 분석 기록이 없는 항목). */
export const toEmptyRow = (item: MeasurementItemSnapshot): AnalysisRowForm => ({
  pollutantId: item.pollutantId,
  hasSavedValue: false,
  pollutantName: item.nameKr,
  allowance: item.allowance,
  oxygenApplicable: item.oxygenApplicable,
  samplingStartedAt: "",
  samplingEndedAt: "",
  analysisValue: "",
  // 분석방법·장비는 측정항목 원장에 이미 있는 값이라 초기값으로 채운다. 실제 분석에서 달라졌으면 고쳐 저장한다.
  unit: "",
  analysisMethod: item.testMethod ?? "",
  analysisEquipment: item.equipment ?? "",
});

/** 서버 기록을 행으로 되돌린다(저장 직후 폼 동기화·재조회 공통). */
export const toSavedRow = (row: AnalysisRowForm, result: AnalysisResult): AnalysisRowForm => ({
  ...row,
  hasSavedValue: result.analysisValue !== null,
  allowance: result.allowance,
  oxygenApplicable: result.oxygenApplicable,
  samplingStartedAt: formatTime(result.samplingStartedAt),
  samplingEndedAt: formatTime(result.samplingEndedAt),
  analysisValue: result.analysisValue === null ? "" : String(result.analysisValue),
  // 예전 기록에는 enum 값이 아니라 표기('ppm')가 들어 있어 Select 가 고를 수 있는 값으로 되돌린다
  unit: toMeasurementUnit(result.unit),
  analysisMethod: result.analysisMethod ?? "",
  analysisEquipment: result.analysisEquipment ?? "",
});
