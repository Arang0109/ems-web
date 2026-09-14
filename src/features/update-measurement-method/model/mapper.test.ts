import { describe, it, expect } from "vitest";

import type { MeasurementMethod } from "@entities/measurement-method";

import { toMeasurementMethodUpdate } from "./mapper";
import { getDefaultForm } from "./types";

const cartridge: MeasurementMethod = {
  id: 8,
  name: "카트리지",
  sampleGrouping: "MERGED",
  mergedSampleName: "VOCs",
  samplingMinutes: 30,
  sortOrder: 80,
};

describe("toMeasurementMethodUpdate", () => {
  it("폼 값을 그대로 옮긴다", () => {
    expect(toMeasurementMethodUpdate(getDefaultForm(cartridge))).toEqual({
      name: "카트리지",
      sampleGrouping: "MERGED",
      mergedSampleName: "VOCs",
      samplingMinutes: 30,
    });
  });

  // 서버는 채취시간을 전체 채택으로 읽는다 — 비운 칸은 "미지정"으로 저장되어야 한다.
  it("채취시간을 비우면 null 로 보내 실제로 비운다", () => {
    const form = { ...getDefaultForm(cartridge), samplingMinutes: "" };

    expect(toMeasurementMethodUpdate(form).samplingMinutes).toBeNull();
  });

  it("채취시간은 숫자로 바뀐다", () => {
    const form = { ...getDefaultForm(cartridge), samplingMinutes: "45" };

    expect(toMeasurementMethodUpdate(form).samplingMinutes).toBe(45);
  });

  // 통칭 채취 → 항목별 채취로 바꿀 때 통칭명이 남아 있으면 서버가 400 이다. 폼 값이 남아 있어도 걸러야 한다.
  it("통칭 채취가 아니면 남아 있는 통칭명을 버린다", () => {
    const form = { ...getDefaultForm(cartridge), sampleGrouping: "PER_ITEM" as const };

    expect(toMeasurementMethodUpdate(form).mergedSampleName).toBeNull();
    expect(toMeasurementMethodUpdate(form).sampleGrouping).toBe("PER_ITEM");
  });

  it("통칭명의 앞뒤 공백을 정리한다", () => {
    const form = { ...getDefaultForm(cartridge), mergedSampleName: "  VOCs  " };

    expect(toMeasurementMethodUpdate(form).mergedSampleName).toBe("VOCs");
  });

  it("미지정 채취시간은 빈 폼 값으로 시작한다", () => {
    const unset: MeasurementMethod = { ...cartridge, samplingMinutes: null };

    expect(getDefaultForm(unset).samplingMinutes).toBe("");
  });
});
