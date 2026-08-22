import { describe, expect, it } from "vitest";

import {
  SCHEDULE_STATUS, canTransitionScheduleStatus,
  canReopenSchedule, requiresAdminToReopenSchedule, canDeleteSchedule,
} from "./common-types";

// 서버 ScheduleStatus.canTransitionTo() 와 같은 규칙이어야 한다.
// 어긋나면 화면은 액션을 노출하는데 서버가 400으로 거부하는 상태가 된다.
describe("canTransitionScheduleStatus", () => {
  it("측정예정에서는 측정중과 취소로만 넘어간다", () => {
    expect(canTransitionScheduleStatus("SCHEDULED", "MEASURING")).toBe(true);
    expect(canTransitionScheduleStatus("SCHEDULED", "CANCELED")).toBe(true);
    expect(canTransitionScheduleStatus("SCHEDULED", "ANALYZING")).toBe(false);
    expect(canTransitionScheduleStatus("SCHEDULED", "REPORT_COMPLETED")).toBe(false);
  });

  it("단계를 건너뛸 수 없다", () => {
    expect(canTransitionScheduleStatus("MEASURING", "REPORT_COMPLETED")).toBe(false);
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

  it("성적서작성완료·취소는 종단 상태라 어떤 전이도 허용하지 않는다", () => {
    for (const to of SCHEDULE_STATUS) {
      expect(canTransitionScheduleStatus("REPORT_COMPLETED", to)).toBe(false);
      expect(canTransitionScheduleStatus("CANCELED", to)).toBe(false);
    }
  });

  it("같은 상태로의 전이는 허용하지 않는다", () => {
    for (const status of SCHEDULE_STATUS) {
      expect(canTransitionScheduleStatus(status, status)).toBe(false);
    }
  });
});

// 서버 ScheduleStatus.canReopen() / requiresAdminToReopen() 과 같은 규칙이어야 한다.
describe("canReopenSchedule", () => {
  it("종단 상태(성적서작성완료·취소)는 되돌릴 수 있다", () => {
    expect(canReopenSchedule("REPORT_COMPLETED")).toBe(true);
    expect(canReopenSchedule("CANCELED")).toBe(true);
  });

  it("진행 중인 계획은 되돌릴 것이 없다", () => {
    for (const status of ["SCHEDULED", "MEASURING", "ANALYZING"] as const) {
      expect(canReopenSchedule(status)).toBe(false);
    }
  });

  it("일반 전이 표에는 재개방이 들어 있지 않다", () => {
    expect(canTransitionScheduleStatus("REPORT_COMPLETED", "ANALYZING")).toBe(false);
    expect(canTransitionScheduleStatus("CANCELED", "SCHEDULED")).toBe(false);
  });
});

describe("requiresAdminToReopenSchedule", () => {
  it("성적서작성완료 재개방만 관리자 권한을 요구한다", () => {
    expect(requiresAdminToReopenSchedule("REPORT_COMPLETED")).toBe(true);
  });

  // 실수로 취소하면 입력한 측정 데이터가 잠기므로 담당자가 즉시 되돌릴 수 있어야 한다.
  it("취소 철회는 담당자도 할 수 있다", () => {
    expect(requiresAdminToReopenSchedule("CANCELED")).toBe(false);
  });
});

// 서버 ScheduleStatus.canDelete() 와 같은 규칙이어야 한다.
describe("canDeleteSchedule", () => {
  it("실측 데이터가 없는 측정예정은 삭제할 수 있다", () => {
    expect(canDeleteSchedule("SCHEDULED")).toBe(true);
  });

  // 취소 건에는 사유를 남겨 둬야 할 것과 잘못 만들어진 것이 섞여 있어 골라 감출 수 있어야 한다.
  it("취소된 계획도 삭제할 수 있다", () => {
    expect(canDeleteSchedule("CANCELED")).toBe(true);
  });

  it("진행 중이거나 성적서작성완료된 계획은 삭제할 수 없다 — 취소를 먼저 거친다", () => {
    for (const status of ["MEASURING", "ANALYZING", "REPORT_COMPLETED"] as const) {
      expect(canDeleteSchedule(status)).toBe(false);
    }
  });

  it("측정예정은 '잘못 등록'(삭제)일 수도 '무산'(취소)일 수도 있어 둘 다 열려 있다", () => {
    expect(canDeleteSchedule("SCHEDULED") && canTransitionScheduleStatus("SCHEDULED", "CANCELED")).toBe(true);
  });
});
