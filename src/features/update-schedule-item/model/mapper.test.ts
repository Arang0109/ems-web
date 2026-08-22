import { describe, expect, it } from "vitest";

import { toScheduleItemUpdate, toStackPollutantUpdate } from "./mapper";
import type { ScheduleItemUpdateForm } from "./types";

const form = (over: Partial<ScheduleItemUpdateForm> = {}): ScheduleItemUpdateForm => ({
  cycle: "MONTHLY",
  allowance: "30",
  oxygenApplicable: false,
  applyToStack: true,
  ...over,
});

describe("toScheduleItemUpdate", () => {
  it("허용기준을 number 로 바꾼다 — 콤마가 섞여도 읽는다", () => {
    expect(toScheduleItemUpdate(form({ allowance: "1,200" })).allowance).toBe(1200);
  });

  it("빈 허용기준은 0이 아니라 null 이다 — 0으로 보내면 모든 값이 초과로 판정된다", () => {
    expect(toScheduleItemUpdate(form({ allowance: "" })).allowance).toBeNull();
  });

  it("원장 반영 여부는 요청에 담기지 않는다 — 그것은 다른 API 를 부를지의 문제다", () => {
    expect(toScheduleItemUpdate(form())).not.toHaveProperty("applyToStack");
  });
});

describe("toStackPollutantUpdate", () => {
  it("같은 폼에서 원장 요청도 같은 값으로 만든다 — 두 저장소가 갈라지지 않게", () => {
    const source = form({ allowance: "45", oxygenApplicable: true, cycle: "QUARTERLY" });

    expect(toStackPollutantUpdate(source)).toEqual({
      cycle: "QUARTERLY",
      allowance: 45,
      oxygenApplicable: true,
    });
  });
});
