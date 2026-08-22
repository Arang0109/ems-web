import { describe, expect, it } from "vitest";

import type { SheetCalcPreview } from "@entities/schedule";

import {
  getDefaultBasicInfoForm,
  getDefaultSampleForm,
  getDefaultSamplingPointForm,
  getDefaultSheetForm,
} from "./types";
import type { ScheduleBasicInfoForm, SheetForm } from "./types";
import { buildSamplingTimeline, unrollNear } from "./sampling-timeline";
import type { SamplingTimeline } from "./sampling-timeline";

const basicInfo = (start = "", end = ""): ScheduleBasicInfoForm => ({
  ...getDefaultBasicInfoForm(),
  samplingStartedAt: start,
  samplingEndedAt: end,
});

/** 가스상 시트 — 입자상 행이 끼어들지 않아 케이스를 좁게 볼 수 있다 */
const gasSheet = (over: Partial<SheetForm> = {}): SheetForm => ({
  ...getDefaultSheetForm("GAS"),
  ...over,
});

const previewWithVm = (vm_g: number | null): SheetCalcPreview =>
  ({ moisture: { vm_g } } as SheetCalcPreview);

const build = (
  info: ScheduleBasicInfoForm,
  sheet: SheetForm,
  previewCalc: SheetCalcPreview | null = null,
): SamplingTimeline => buildSamplingTimeline({ basicInfo: info, sheet, previewCalc });

const rowOf = (timeline: SamplingTimeline, id: string) =>
  timeline.rows.find((row) => row.id === id);

/** 구간 길이(분) — 축 오프셋의 차이 */
const spanOf = (timeline: SamplingTimeline, id: string): number | null => {
  const row = rowOf(timeline, id);
  return row ? row.endOffset - row.startOffset : null;
};

const codes = (timeline: SamplingTimeline) => timeline.issues.map((issue) => issue.code);

describe("unrollNear", () => {
  it("앵커에서 가장 가까운 해석을 고른다", () => {
    // 22:00 기준 05:00 은 다음 날(+420분)이 더 가깝다
    expect(unrollNear(300, 1320)).toBe(1740);
    // 09:30 기준 08:30 은 같은 날 한 시간 전(-60분)이 더 가깝다
    expect(unrollNear(510, 570)).toBe(510);
  });

  it("앵커와 같으면 그대로 둔다", () => {
    expect(unrollNear(570, 570)).toBe(570);
  });
});

describe("buildSamplingTimeline — 행 생성", () => {
  it("시각이 하나도 없으면 빈 타임라인이다", () => {
    const timeline = build(basicInfo(), gasSheet());
    expect(timeline.rows).toEqual([]);
    expect(timeline.axis).toBeNull();
    expect(timeline.issues).toEqual([]);
  });

  it("시작시각이 빈 항목은 행을 만들지 않는다", () => {
    const timeline = build(basicInfo("09:00", "17:00"), gasSheet());
    expect(timeline.rows.map((r) => r.id)).toEqual(["total"]);
  });

  it("수분은 흡입량 ÷ 흡인유속으로 종료를 구한 구간이 된다", () => {
    const sheet = gasSheet({
      moisture: { ...getDefaultSheetForm("GAS").moisture, samplingStartTime: "09:10", suctionVelocity: "2" },
    });
    const row = rowOf(build(basicInfo(), sheet, previewWithVm(60)), "moisture");

    expect(row?.startText).toBe("09:10");
    expect(row?.endText).toBe("09:40");
    expect(row?.endDerived).toBe(true);
    expect(row?.isMarker).toBe(false);
  });

  it("흡인유속이 없거나 0 이면 수분은 시점 마커로 남고 위반은 내지 않는다", () => {
    const base = getDefaultSheetForm("GAS").moisture;

    for (const suctionVelocity of ["", "0"]) {
      const sheet = gasSheet({
        moisture: { ...base, samplingStartTime: "09:10", suctionVelocity },
      });
      const timeline = build(basicInfo(), sheet, previewWithVm(60));
      const row = rowOf(timeline, "moisture");

      expect(row?.isMarker).toBe(true);
      expect(row?.endText).toBeNull();
      expect(row?.note).toBeDefined();
      expect(codes(timeline)).not.toContain("reversed-range");
    }
  });

  it("가스분석기는 15분, THC 는 30분 구간이 된다", () => {
    const sheet = gasSheet({
      exhaustGas: {
        ...getDefaultSheetForm("GAS").exhaustGas,
        gasAnalyzerStartTime: "10:00",
        thcAnalyzerStartTime: "11:00",
      },
    });
    const timeline = build(basicInfo(), sheet);

    expect(rowOf(timeline, "gas")?.endText).toBe("10:15");
    expect(rowOf(timeline, "thc")?.endText).toBe("11:30");
  });

  it("입자상은 저장된 종료시각이 아니라 지점 채취시간 합으로 구한다", () => {
    const sheet: SheetForm = {
      ...getDefaultSheetForm("DUST"),
      particle: {
        ...getDefaultSheetForm("DUST").particle,
        samplingStartTime: "09:00",
        samplingEndTime: "23:59",     // 어긋난 저장값 — 무시되어야 한다
      },
      samplingPoints: [
        { ...getDefaultSamplingPointForm(), samplingTime: "30" },
        { ...getDefaultSamplingPointForm(), samplingTime: "30" },
      ],
    };
    const row = rowOf(build(basicInfo(), sheet), "particle");

    expect(row?.startText).toBe("09:00");
    expect(row?.endText).toBe("10:00");
  });

  it("가스상 항목은 항목명을 라벨로 쓰고, 비면 순번으로 대체한다", () => {
    const sheet = gasSheet({
      samples: [
        { ...getDefaultSampleForm(), sampleName: "암모니아", startTime: "09:00", endTime: "09:30" },
        { ...getDefaultSampleForm(), startTime: "10:00", endTime: "10:30" },
      ],
    });
    const timeline = build(basicInfo(), sheet);

    expect(rowOf(timeline, "sample-0")?.label).toBe("암모니아");
    expect(rowOf(timeline, "sample-1")?.label).toBe("가스상 항목 2");
  });
});

describe("buildSamplingTimeline — 자정 해석", () => {
  it("야간 측정을 역전으로 오판하지 않는다", () => {
    const timeline = build(basicInfo("22:00", "01:00"), gasSheet());
    const row = rowOf(timeline, "total");

    expect(row?.isMarker).toBe(false);
    expect(spanOf(timeline, "total")).toBe(180);
    expect(codes(timeline)).not.toContain("reversed-range");
    expect(codes(timeline)).toContain("crosses-midnight");
  });

  it("종료가 시작보다 조금 빠르면 오타로 보고 경고한다", () => {
    const timeline = build(basicInfo("09:30", "08:30"), gasSheet());
    const row = rowOf(timeline, "total");

    expect(row?.isMarker).toBe(true);
    expect(row?.endText).toBe("08:30");   // 무엇이 잘못됐는지 보여줘야 고칠 수 있다
    expect(codes(timeline)).toContain("reversed-range");
  });

  it("파생 종료가 자정을 넘으면 표시는 순환하되 좌표는 이어진다", () => {
    const sheet = gasSheet({
      exhaustGas: { ...getDefaultSheetForm("GAS").exhaustGas, thcAnalyzerStartTime: "23:50" },
    });
    const timeline = build(basicInfo(), sheet);

    expect(rowOf(timeline, "thc")?.endText).toBe("00:20");
    expect(spanOf(timeline, "thc")).toBe(30);
  });
});

describe("buildSamplingTimeline — 위반 판정", () => {
  it("총 채취시간 밖으로 나간 항목을 경고한다", () => {
    const sheet = gasSheet({
      samples: [{ ...getDefaultSampleForm(), startTime: "08:30", endTime: "09:10" }],
    });
    const timeline = build(basicInfo("09:00", "17:00"), sheet);

    expect(codes(timeline)).toContain("outside-total");
    expect(timeline.worstLevel).toBe("danger");
  });

  it("총 채취시간 안에 있으면 위반이 없다", () => {
    const sheet = gasSheet({
      samples: [{ ...getDefaultSampleForm(), startTime: "09:30", endTime: "10:10" }],
    });
    const timeline = build(basicInfo("09:00", "17:00"), sheet);

    expect(timeline.issues).toEqual([]);
    expect(timeline.worstLevel).toBeNull();
  });

  it("총 채취시간이 비면 범위를 확인할 수 없다고 알린다", () => {
    const sheet = gasSheet({
      moisture: { ...getDefaultSheetForm("GAS").moisture, samplingStartTime: "09:10" },
    });
    expect(codes(build(basicInfo(), sheet))).toContain("total-missing");
  });

  it("가스상 항목끼리 겹쳐도 위반이 아니다 — 동시 채취가 정상이다", () => {
    const sheet = gasSheet({
      samples: [
        { ...getDefaultSampleForm(), startTime: "09:00", endTime: "10:00" },
        { ...getDefaultSampleForm(), startTime: "09:30", endTime: "10:30" },
      ],
    });
    const timeline = build(basicInfo("09:00", "17:00"), sheet);

    expect(timeline.issues).toEqual([]);
  });

  it("채취시간이 0분이면 주의를 낸다", () => {
    expect(codes(build(basicInfo("09:00", "09:00"), gasSheet()))).toContain("zero-duration");
  });

  it("경고를 주의보다 앞에 놓는다", () => {
    const sheet = gasSheet({
      samples: [{ ...getDefaultSampleForm(), startTime: "08:00", endTime: "08:00" }],
    });
    const timeline = build(basicInfo("09:00", "17:00"), sheet);

    expect(timeline.issues[0].level).toBe("danger");
    expect(timeline.issueCount).toBe(timeline.issues.length);
  });
});

describe("buildSamplingTimeline — 축", () => {
  it("시각이 한 점뿐이면 최소 폭을 보장한다", () => {
    const sheet = gasSheet({
      exhaustGas: { ...getDefaultSheetForm("GAS").exhaustGas, gasAnalyzerStartTime: "10:00" },
    });
    // 가스분석기는 15분 구간이라 여백을 더해도 최소 폭 30분으로 확장된다
    expect(build(basicInfo(), sheet).axis?.spanMinutes).toBe(30);
  });

  it("구간을 다 담을 만큼 축을 넓힌다", () => {
    const timeline = build(basicInfo("09:00", "17:00"), gasSheet());
    expect(timeline.axis!.spanMinutes).toBeGreaterThanOrEqual(480);
  });

  it("눈금은 축 안에 4~7개가 놓인다", () => {
    const ticks = build(basicInfo("09:00", "17:00"), gasSheet()).axis!.ticks;
    expect(ticks.length).toBeGreaterThanOrEqual(4);
    expect(ticks.length).toBeLessThanOrEqual(7);
  });
});
