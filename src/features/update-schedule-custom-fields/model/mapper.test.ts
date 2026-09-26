import { describe, it, expect } from "vitest";

import type { ScheduleCustomField } from "@entities/schedule-custom-field";

import { toScheduleCustomFieldsSave } from "./mapper";
import { getDefaultForm } from "./types";
import { validateScheduleCustomFieldsFields } from "./validator";

const definitions: ScheduleCustomField[] = [
  { id: 1, key: "siteCode", label: "현장 코드", sortOrder: 10 },
  { id: 2, key: "inspector", label: "점검자", sortOrder: 20 },
];

describe("getDefaultForm", () => {
  it("정의된 키마다 칸을 만들고 스냅샷 값으로 채운다", () => {
    expect(getDefaultForm(definitions, { siteCode: "A-01" })).toEqual({ siteCode: "A-01", inspector: "" });
  });

  // 필드 도입 전 문서는 customFields 가 null 이다.
  it("스냅샷 값이 없어도 빈 칸을 만든다", () => {
    expect(getDefaultForm(definitions, null)).toEqual({ siteCode: "", inspector: "" });
  });

  // 정의가 지워진 키의 옛 값은 폼에 올리지 않는다 — 저장하면 서버가 정리한다.
  it("정의에 없는 스냅샷 키는 버린다", () => {
    expect(getDefaultForm(definitions, { siteCode: "A-01", gone: "old" })).not.toHaveProperty("gone");
  });
});

describe("toScheduleCustomFieldsSave", () => {
  it("정의된 키 전부를 싣고 빈 값은 빈 문자열로 보낸다(전체 채택)", () => {
    const save = toScheduleCustomFieldsSave({ siteCode: " A-01 ", inspector: "" }, definitions);

    expect(save.values).toEqual({ siteCode: "A-01", inspector: "" });
  });

  it("정의에 없는 키는 싣지 않는다 — 서버가 400 으로 거부한다", () => {
    const save = toScheduleCustomFieldsSave({ siteCode: "A-01", nope: "x" }, definitions);

    expect(save.values).not.toHaveProperty("nope");
  });
});

describe("validateScheduleCustomFieldsFields", () => {
  it("500자를 넘는 값만 거부한다", () => {
    const errors = validateScheduleCustomFieldsFields({ siteCode: "a".repeat(501), inspector: "a".repeat(500) });

    expect(errors.siteCode).toBeDefined();
    expect(errors.inspector).toBeUndefined();
  });
});
