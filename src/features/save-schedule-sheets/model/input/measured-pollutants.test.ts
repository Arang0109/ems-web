import { describe, expect, it } from "vitest";

import { getDefaultExhaustGasForm } from "../types";
import { getExhaustGasVisibility, hasSavedExhaustGasValue } from "./measured-pollutants";

describe("hasSavedExhaustGasValue", () => {
  it("기본 폼은 어느 항목도 값이 없다", () => {
    const form = getDefaultExhaustGasForm();
    expect(hasSavedExhaustGasValue(form, "thc")).toBe(false);
    expect(hasSavedExhaustGasValue(form, "nox")).toBe(false);
    expect(hasSavedExhaustGasValue(form, "sox")).toBe(false);
  });

  it("회차 중 하나라도 채워져 있으면 값이 있다고 본다", () => {
    const form = { ...getDefaultExhaustGasForm(), nox: ["", "12.5", ""] };
    expect(hasSavedExhaustGasValue(form, "nox")).toBe(true);
    expect(hasSavedExhaustGasValue(form, "sox")).toBe(false);
  });

  it("THC 는 분석기 시작시간으로 판정한다", () => {
    const form = { ...getDefaultExhaustGasForm(), thcAnalyzerStartTime: "09:30" };
    expect(hasSavedExhaustGasValue(form, "thc")).toBe(true);
  });
});

describe("getExhaustGasVisibility", () => {
  const none = { thc: false, nox: false, sox: false };

  it("배정되지 않았어도 기존 값이 있으면 노출한다", () => {
    const visibility = getExhaustGasVisibility(none, { ...none, sox: true });
    expect(visibility.sox).toBe(true);
  });

  it("기존 값이 없어도 배정돼 있으면 노출한다", () => {
    const visibility = getExhaustGasVisibility({ ...none, nox: true }, none);
    expect(visibility.nox).toBe(true);
  });

  it("배정도 기존 값도 없으면 숨긴다", () => {
    expect(getExhaustGasVisibility(none, none)).toEqual(none);
  });
});
