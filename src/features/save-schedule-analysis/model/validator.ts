import { hasAnalysisInput, type AnalysisRowForm } from "./types";

/**
 * 저장 대상(= 바뀐 행)의 형식 검증. 키는 측정물질 id다 — 행이 목록이라 필드명으로는 어느 행인지
 * 지목할 수 없다. 호출부는 바뀐 행만 넘긴다(손대지 않은 빈 행은 검증 대상이 아니다).
 *
 * 분석값 외의 값(단위·방법·장비)만 채운 행도 오류로 잡는다. 서버에서 분석값이 필수라
 * 저장 시점에 400으로 튕기는데, 그때는 어느 항목인지 화면에서 짚어 주기 어렵다.
 *
 * <b>채취시각은 검증 대상이 아니다.</b> 같은 표에 있지만 저장 경로가 다르고 필수도 아니다 —
 * 호출부는 실험실 입력값이 바뀐 행만 넘긴다.
 */
export const validateAnalysisRows = (rows: AnalysisRowForm[]): Record<number, string> => {
  const errors: Record<number, string> = {};

  for (const row of rows) {
    const value = row.analysisValue.trim();

    // 저장된 값을 지운 경우. 서버는 null을 "기존 값 유지"로 읽어 아무 일도 일어나지 않으므로,
    // 지웠다고 착각하고 넘어가지 않도록 여기서 막고 삭제 경로로 안내한다.
    // 판정 기준은 `analysisId` 가 아니라 `hasSavedValue` 다 — 채취시각만 저장해도 문서는 생기므로,
    // 문서 유무로 가르면 분석값을 한 번도 넣지 않은 행이 오류로 잡힌다.
    if (value === "" && row.hasSavedValue) {
      errors[row.pollutantId] = "값을 비울 수는 없습니다. 입력을 취소하려면 삭제를 사용해주세요.";
      continue;
    }
    if (!hasAnalysisInput(row) && hasSideInput(row) && !row.hasSavedValue) {
      errors[row.pollutantId] = "측정분석값을 입력해주세요.";
      continue;
    }
    if (value !== "" && !Number.isFinite(Number(value.replace(/,/g, "")))) {
      errors[row.pollutantId] = "측정분석값은 숫자로 입력해주세요.";
    }
  }

  return errors;
};

/** 분석값 없이 단위·분석방법·분석장비만 채워진 상태인지 여부. */
const hasSideInput = (row: AnalysisRowForm): boolean =>
  row.unit.trim() !== "" || row.analysisMethod.trim() !== "" || row.analysisEquipment.trim() !== "";
