import { describe, expect, it } from "vitest";

import { withSubjectJosa } from "./josa";

describe("withSubjectJosa", () => {
  it("받침이 있으면 '이' 를 붙인다", () => {
    expect(withSubjectJosa("총 채취시간")).toBe("총 채취시간이");
    expect(withSubjectJosa("먼지값")).toBe("먼지값이");
  });

  it("받침이 없으면 '가' 를 붙인다", () => {
    expect(withSubjectJosa("수분 채취")).toBe("수분 채취가");
    expect(withSubjectJosa("가스분석기")).toBe("가스분석기가");
  });

  it("한글이 아닌 말은 발음이 갈리므로 병기형으로 남긴다", () => {
    expect(withSubjectJosa("THC")).toBe("THC이(가)");
    expect(withSubjectJosa("NOx")).toBe("NOx이(가)");
  });

  it("빈 문자열도 병기형으로 안전하게 처리한다", () => {
    expect(withSubjectJosa("")).toBe("이(가)");
  });
});
