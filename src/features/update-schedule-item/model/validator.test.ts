import { describe, expect, it } from "vitest";

import { validateScheduleItemFields } from "./validator";
import type { ScheduleItemUpdateForm } from "./types";

const form = (allowance: string): ScheduleItemUpdateForm => ({
  cycle: "MONTHLY",
  allowance,
  oxygenApplicable: false,
  applyToStack: true,
});

describe("validateScheduleItemFields", () => {
  it("허용기준은 비워 둘 수 있다 — '미지정'이 유효한 값이다", () => {
    expect(validateScheduleItemFields(form(""))).toEqual({});
  });

  it("콤마가 섞인 숫자는 통과시킨다 — mapper 가 같은 규칙으로 읽는다", () => {
    expect(validateScheduleItemFields(form("1,200"))).toEqual({});
  });

  it("숫자로 읽히지 않는 입력은 서버 400 전에 막는다", () => {
    expect(validateScheduleItemFields(form("30ppm")).allowance).toBeDefined();
  });

  it("음수 허용기준은 막는다", () => {
    expect(validateScheduleItemFields(form("-1")).allowance).toBeDefined();
  });
});
