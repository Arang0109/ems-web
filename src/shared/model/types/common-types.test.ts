import { describe, expect, it } from "vitest";

import { SCHEDULE_STATUS, canTransitionScheduleStatus } from "./common-types";

// 서버 ScheduleStatus.canTransitionTo() 와 같은 규칙이어야 한다.
// 어긋나면 화면은 액션을 노출하는데 서버가 400으로 거부하는 상태가 된다.
describe("canTransitionScheduleStatus", () => {
  it("측정예정에서는 측정중과 취소로만 넘어간다", () => {
    expect(canTransitionScheduleStatus("SCHEDULED", "MEASURING")).toBe(true);
    expect(canTransitionScheduleStatus("SCHEDULED", "CANCELED")).toBe(true);
    expect(canTransitionScheduleStatus("SCHEDULED", "ANALYZING")).toBe(false);
    expect(canTransitionScheduleStatus("SCHEDULED", "COMPLETED")).toBe(false);
  });

  it("단계를 건너뛸 수 없다", () => {
    expect(canTransitionScheduleStatus("MEASURING", "COMPLETED")).toBe(false);
  });

  it("되돌릴 수 없다", () => {
    expect(canTransitionScheduleStatus("MEASURING", "SCHEDULED")).toBe(false);
    expect(canTransitionScheduleStatus("ANALYZING", "MEASURING")).toBe(false);
  });

  it("진행 중인 어느 단계에서든 취소할 수 있다", () => {
    expect(canTransitionScheduleStatus("SCHEDULED", "CANCELED")).toBe(true);
    expect(canTransitionScheduleStatus("MEASURING", "CANCELED")).toBe(true);
    expect(canTransitionScheduleStatus("ANALYZING", "CANCELED")).toBe(true);
  });

  it("완료·취소는 종단 상태라 어떤 전이도 허용하지 않는다", () => {
    for (const to of SCHEDULE_STATUS) {
      expect(canTransitionScheduleStatus("COMPLETED", to)).toBe(false);
      expect(canTransitionScheduleStatus("CANCELED", to)).toBe(false);
    }
  });

  it("같은 상태로의 전이는 허용하지 않는다", () => {
    for (const status of SCHEDULE_STATUS) {
      expect(canTransitionScheduleStatus(status, status)).toBe(false);
    }
  });
});
