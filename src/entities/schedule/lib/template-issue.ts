import type { TemplateIssue } from "../model/types";
import { TEMPLATE_EXPRESSION_SOURCE_LABEL, TEMPLATE_ISSUE_TYPE_LABEL } from "@shared/config";

/** 템플릿 검사 문제 한 건의 표시용 문장. */
export type TemplateIssueDescription = {
  /** `Record · B3(셀)` — 시트 단위 문제면 `Record` */
  location: string;
  /** 문제 종류 라벨 */
  title: string;
  /** 무엇이 문제인지 — 이름과 표현식 */
  detail: string;
};

/**
 * 검사 문제를 사람이 읽을 문장으로 바꾼다. 여러 화면(내보내기 모달·문서 등록)이 같은 목록을 그리므로
 * 문장 조립은 한곳에 둔다 — 규약대로 순수 함수라 여기(lib)에 있다.
 */
export const describeTemplateIssue = (issue: TemplateIssue): TemplateIssueDescription => {
  const where = issue.cell
    ? `${issue.sheetName} · ${issue.cell}${issue.source ? `(${TEMPLATE_EXPRESSION_SOURCE_LABEL[issue.source]})` : ""}`
    : issue.sheetName;

  const detail = issue.type === "AREA_MISSING"
    ? "이 시트에 ${...} 표현식이 있지만 jx:area 메모가 없어 채워지지 않습니다."
    : issue.expression && issue.expression !== issue.name
      ? `${issue.name} — 표현식 "${issue.expression}"`
      : issue.name;

  return { location: where, title: TEMPLATE_ISSUE_TYPE_LABEL[issue.type], detail };
};
