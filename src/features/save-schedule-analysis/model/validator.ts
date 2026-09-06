import { hasAnalysisInput, type AnalysisRowForm } from "./types";

/**
 * 저장 대상(= 바뀐 행)의 형식 검증. 키는 측정물질 id다 — 행이 목록이라 필드명으로는 어느 행인지
 * 지목할 수 없다. 호출부는 바뀐 행만 넘긴다(손대지 않은 빈 행은 검증 대상이 아니다).
 *
 * 분석값 외의 값(단위·방법·장비)만 채운 행도 오류로 잡는다. 서버는 받아 주지만 성적서에 실릴
 * 값이 없는 기록이라, 저장해 두면 입력이 끝난 항목처럼 보인다.
 *
 * <b>값을 비우는 것은 오류가 아니다.</b> 서버가 전달된 항목의 빈 값을 "지웠다"로 읽으므로,
 * 잘못 넣은 결과는 칸을 비우고 저장해 지운다(별도 삭제 경로가 없다).
 *
 * <b>채취시각은 검증 대상이 아니다.</b> 같은 표에 있지만 저장 경로가 다르고 필수도 아니다 —
 * 호출부는 실험실 입력값이 바뀐 행만 넘긴다.
 */
export const validateAnalysisRows = (rows: AnalysisRowForm[]): Record<number, string> => {
  const errors: Record<number, string> = {};

  for (const row of rows) {
    const value = row.analysisValue.trim();

    // 네 칸을 모두 비운 행은 "지웠다"는 뜻이라 통과시킨다.
    if (value === "" && !hasSideInput(row)) continue;

    // 아래 판정 기준이 `hasSavedValue` 인 이유 — 채취시각만 저장된 항목도 있어서,
    // "분석 결과가 있는가"로 가르면 분석값을 한 번도 넣지 않은 행까지 걸린다.
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
