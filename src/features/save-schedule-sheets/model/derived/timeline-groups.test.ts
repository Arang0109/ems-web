import { describe, expect, it } from "vitest";

import { getDefaultBasicInfoForm, getDefaultSampleForm, getDefaultSheetForm } from "../types";
import type { SampleForm } from "../types";
import { buildSamplingTimeline } from "./sampling-timeline";
import { buildTimelineGroups, describeMinutes } from "./timeline-groups";

const sample = (sampleName: string, startTime: string, endTime: string): SampleForm => ({
  ...getDefaultSampleForm(), sampleName, startTime, endTime,
});

const groupsOf = (samples: SampleForm[], start = "09:00", end = "13:00") =>
  buildTimelineGroups(
    buildSamplingTimeline({
      basicInfo: { ...getDefaultBasicInfoForm(), samplingStartedAt: start, samplingEndedAt: end },
      sheets: [{ sheet: { ...getDefaultSheetForm("GAS"), samples }, previewCalc: null }],
    }),
  );

const labelsOf = (result: ReturnType<typeof groupsOf>) =>
  result.groups.map((group) => group.rows.map((row) => row.label));

describe("buildTimelineGroups", () => {
  it("총 채취시간은 묶음에 넣지 않고 따로 낸다", () => {
    const result = groupsOf([sample("A", "09:10", "09:40")]);
    expect(result.total?.kind).toBe("total");
    expect(labelsOf(result)).toEqual([["A"]]);
  });

  it("겹치는 항목끼리 묶고, 끝나는 순간에 시작하면 새 묶음이다", () => {
    const result = groupsOf([
      sample("A", "09:00", "09:30"),
      sample("B", "09:10", "09:40"),
      sample("C", "09:40", "10:00"),
    ]);
    expect(labelsOf(result)).toEqual([["A", "B"], ["C"]]);
    expect(result.groups[1].gapBeforeMinutes).toBeNull();
  });

  it("묶음 사이의 빈 시간을 공백으로 낸다", () => {
    const result = groupsOf([sample("A", "09:00", "09:30"), sample("B", "09:50", "10:00")]);
    expect(result.groups[1].gapBeforeMinutes).toBe(20);
  });

  it("묶음의 동시 진행 수는 한순간에 겹친 최댓값이다", () => {
    // 긴 구간 하나 위에 짧은 두 구간이 차례로 — 3개가 한 묶음이지만 동시에는 2개
    const result = groupsOf([
      sample("긴", "09:00", "10:00"),
      sample("앞", "09:10", "09:30"),
      sample("뒤", "09:30", "09:50"),
    ]);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].maxConcurrency).toBe(2);
    expect([result.groups[0].startText, result.groups[0].endText]).toEqual(["09:00", "10:00"]);
  });

  it("같은 순간에 시작한 종료 미상 항목도 한 묶음이다", () => {
    const result = groupsOf([sample("미상", "09:10", ""), sample("B", "09:10", "09:40")]);
    expect(labelsOf(result)).toEqual([["미상", "B"]]);
    expect(result.groups[0].maxConcurrency).toBe(2);
  });
});

describe("describeMinutes", () => {
  it("분·시간 단위로 적고 소수는 반올림한다", () => {
    expect(describeMinutes(15)).toBe("15분");
    expect(describeMinutes(60)).toBe("1시간");
    expect(describeMinutes(70)).toBe("1시간 10분");
    expect(describeMinutes(29.6)).toBe("30분");
  });
});
