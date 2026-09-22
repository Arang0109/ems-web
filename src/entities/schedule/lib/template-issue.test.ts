import { describe, it, expect } from "vitest";

import { describeTemplateIssue } from "./template-issue";
import type { TemplateIssue } from "../model/types";

const issue = (overrides: Partial<TemplateIssue>): TemplateIssue => ({
  sheetName: "Record",
  cell: "B3",
  source: "CELL",
  expression: "plan.clientNmae",
  name: "plan.clientNmae",
  type: "UNKNOWN_PROPERTY",
  ...overrides,
});

describe("describeTemplateIssue", () => {
  it("셀 문제는 시트·셀·위치 종류를 함께 적는다", () => {
    const described = describeTemplateIssue(issue({}));

    expect(described.location).toBe("Record · B3(셀)");
    expect(described.title).toBe("없는 항목 이름");
    expect(described.detail).toBe("plan.clientNmae");
  });

  // 표현식 안의 한 변수만 틀린 경우 — 어느 표현식에서 났는지까지 알려야 고칠 수 있다.
  it("표현식과 실패한 이름이 다르면 둘을 함께 보인다", () => {
    const described = describeTemplateIssue(issue({
      expression: "plan.stackName + custom.nope", name: "custom.nope", type: "UNKNOWN_CUSTOM_KEY",
    }));

    expect(described.title).toBe("정의되지 않은 커스텀 필드");
    expect(described.detail).toBe('custom.nope — 표현식 "plan.stackName + custom.nope"');
  });

  it("메모 명령은 위치 종류를 메모로 적는다", () => {
    const described = describeTemplateIssue(issue({
      cell: "A6", source: "COMMENT", expression: "pointz", name: "pointz", type: "UNKNOWN_ROOT",
    }));

    expect(described.location).toBe("Record · A6(메모)");
  });

  it("시트 단위 문제는 셀 없이 시트만 적고 원인을 설명한다", () => {
    const described = describeTemplateIssue(issue({
      cell: null, source: null, expression: null, name: "jx:area", type: "AREA_MISSING",
    }));

    expect(described.location).toBe("Record");
    expect(described.title).toBe("jx:area 메모 없음");
    expect(described.detail).toContain("jx:area");
  });
});
