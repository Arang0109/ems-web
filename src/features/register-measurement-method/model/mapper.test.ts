import { describe, it, expect } from "vitest";

import { toMeasurementMethodCreate } from "./mapper";
import { getDefaultForm } from "./types";
import { validateMeasurementMethodRegisterFields } from "./validator";

describe("toMeasurementMethodCreate", () => {
  it("통칭 채취는 통칭명과 채취시간을 숫자로 싣는다", () => {
    const form = {
      ...getDefaultForm(), name: " 카트리지 ", sampleGrouping: "MERGED" as const,
      mergedSampleName: "VOCs", samplingMinutes: "30",
    };

    expect(toMeasurementMethodCreate(form)).toEqual({
      name: "카트리지",
      sampleGrouping: "MERGED",
      mergedSampleName: "VOCs",
      samplingMinutes: 30,
      sortOrder: null,
    });
  });

  // 서버는 MERGED 가 아닌 단위에 통칭명이 오면 400 이다 — 단위를 바꾸기 전에 적어 둔 값을 걸러야 한다.
  it("항목별 채취는 적어 둔 통칭명을 버린다", () => {
    const form = {
      ...getDefaultForm(), name: "흡수액", sampleGrouping: "PER_ITEM" as const, mergedSampleName: "VOCs",
    };

    expect(toMeasurementMethodCreate(form).mergedSampleName).toBeNull();
  });

  it("채취시간을 비우면 미지정(null)이다", () => {
    const form = { ...getDefaultForm(), name: "먼지", sampleGrouping: "NONE" as const };

    expect(toMeasurementMethodCreate(form).samplingMinutes).toBeNull();
  });
});

describe("validateMeasurementMethodRegisterFields", () => {
  it("이름과 채취 단위는 필수다", () => {
    const errors = validateMeasurementMethodRegisterFields(getDefaultForm());

    expect(errors.name).toBeDefined();
    expect(errors.sampleGrouping).toBeDefined();
  });

  it("통칭 채취는 통칭명이 필수다", () => {
    const form = { ...getDefaultForm(), name: "카트리지", sampleGrouping: "MERGED" as const };

    expect(validateMeasurementMethodRegisterFields(form).mergedSampleName).toBeDefined();
  });

  it("항목별 채취는 통칭명이 없어도 된다", () => {
    const form = { ...getDefaultForm(), name: "흡수액", sampleGrouping: "PER_ITEM" as const };

    expect(validateMeasurementMethodRegisterFields(form)).toEqual({});
  });

  it("채취시간은 0 이상의 정수여야 한다", () => {
    const base = { ...getDefaultForm(), name: "먼지", sampleGrouping: "NONE" as const };

    expect(validateMeasurementMethodRegisterFields({ ...base, samplingMinutes: "12.5" }).samplingMinutes).toBeDefined();
    expect(validateMeasurementMethodRegisterFields({ ...base, samplingMinutes: "-3" }).samplingMinutes).toBeDefined();
    expect(validateMeasurementMethodRegisterFields({ ...base, samplingMinutes: "0" })).toEqual({});
  });
});
