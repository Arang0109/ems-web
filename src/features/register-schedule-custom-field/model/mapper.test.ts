import { describe, it, expect } from "vitest";

import { toScheduleCustomFieldCreate } from "./mapper";
import { getDefaultForm } from "./types";
import { validateScheduleCustomFieldRegisterFields, validateCustomFieldKey } from "./validator";

describe("toScheduleCustomFieldCreate", () => {
  it("공백을 정리하고 표시 순서를 숫자로 싣는다", () => {
    const form = { ...getDefaultForm(), key: " siteCode ", label: " 현장 코드 ", sortOrder: "20" };

    expect(toScheduleCustomFieldCreate(form)).toEqual({ key: "siteCode", label: "현장 코드", sortOrder: 20 });
  });

  it("표시 순서를 비우면 null — 서버가 목록 맨 뒤를 준다", () => {
    const form = { ...getDefaultForm(), key: "siteCode", label: "현장 코드" };

    expect(toScheduleCustomFieldCreate(form).sortOrder).toBeNull();
  });
});

describe("validateCustomFieldKey", () => {
  it.each(["siteCode", "_a1", "STACK_NAME_2", "x"])("영문 식별자 %s 는 허용한다", (key) => {
    expect(validateCustomFieldKey(key)).toBeUndefined();
  });

  // 서버 규칙과 같다 — JEXL 이 `.` 뒤에서 허용하는 것은 ASCII 식별자뿐이라 한글 키는 쓸 수 없다.
  it.each(["굴뚝명2", "site code", "2ndSite", "site.code", "$site", "site-code", ""])("%s 는 거부한다", (key) => {
    expect(validateCustomFieldKey(key)).toBeDefined();
  });

  it("JEXL 예약어와 Map 이 먼저 해석하는 이름은 거부한다", () => {
    expect(validateCustomFieldKey("empty")).toContain("예약어");
    expect(validateCustomFieldKey("class")).toBeDefined();
    expect(validateCustomFieldKey("eq")).toBeDefined();
  });

  it("50자를 넘으면 거부한다", () => {
    expect(validateCustomFieldKey("a".repeat(51))).toBeDefined();
    expect(validateCustomFieldKey("a".repeat(50))).toBeUndefined();
  });
});

describe("validateScheduleCustomFieldRegisterFields", () => {
  it("키와 이름은 필수다", () => {
    const errors = validateScheduleCustomFieldRegisterFields(getDefaultForm());

    expect(errors.key).toBeDefined();
    expect(errors.label).toBeDefined();
    expect(errors.sortOrder).toBeUndefined();
  });

  it("표시 순서는 0 이상의 정수여야 한다", () => {
    const base = { ...getDefaultForm(), key: "siteCode", label: "현장 코드" };

    expect(validateScheduleCustomFieldRegisterFields({ ...base, sortOrder: "1.5" }).sortOrder).toBeDefined();
    expect(validateScheduleCustomFieldRegisterFields({ ...base, sortOrder: "-1" }).sortOrder).toBeDefined();
    expect(validateScheduleCustomFieldRegisterFields({ ...base, sortOrder: "0" })).toEqual({});
  });
});
