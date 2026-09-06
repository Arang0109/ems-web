import { describe, expect, it } from "vitest";

import type { AssignedPollutants } from "./measured-pollutants";
import {
  collectFieldPaths, fieldPath, getMissingBasicInfoFields, getMissingRequiredFields,
  getRequiredFields, readField, sectionOfPath,
} from "./required-fields";
import { getDefaultBasicInfoForm, getDefaultSheetForm } from "./types";
import type { SheetForm } from "./types";

const assigned = (over: Partial<AssignedPollutants> = {}): AssignedPollutants => ({
  thc: false, nox: false, sox: false, ...over,
});

describe("readField", () => {
  const sheet: SheetForm = {
    ...getDefaultSheetForm("DUST", 2),
    weather: { ...getDefaultSheetForm("DUST").weather, pressure: "1013.2" },
  };

  it("중첩 블록·배열·회차를 경로 하나로 읽는다", () => {
    expect(readField(sheet, fieldPath.weather("pressure"))).toBe("1013.2");
    expect(readField(sheet, fieldPath.exhaustReading("o2", 0))).toBe("20.9");
    expect(readField(sheet, fieldPath.exhaustTime("gasAnalyzerStartTime"))).toBe("");
    expect(readField(sheet, fieldPath.point(1, "Ts"))).toBe("");
  });

  it("없는 칸(지워진 측정점·모르는 경로)은 빈 문자열이다", () => {
    expect(readField(sheet, fieldPath.point(9, "Ts"))).toBe("");
    expect(readField(sheet, "nope.nope")).toBe("");
  });
});

describe("sectionOfPath", () => {
  it("입자상 시트 단위 값은 여지 번호만 `여지` 섹션으로 간다", () => {
    expect(sectionOfPath(fieldPath.particle("thimbleFilter"))).toBe("sample");
    expect(sectionOfPath(fieldPath.particle("nozzleSize"))).toBe("point");
    expect(sectionOfPath(fieldPath.sample(0, "sampleName"))).toBe("gaseous");
    expect(sectionOfPath(fieldPath.exhaustReading("o2", 2))).toBe("exhaust");
  });
});

describe("getRequiredFields", () => {
  it("기상정보에서 풍향은 필수가 아니다 — 배지가 5/5 인 근거다", () => {
    const required = getRequiredFields(getDefaultSheetForm("GAS"), "weather", assigned());

    expect(required).toHaveLength(5);
    expect(required).not.toContain(fieldPath.weather("windDirection"));
  });

  it("배출가스는 배정된 오염물질만 분모에 넣는다", () => {
    const sheet = getDefaultSheetForm("GAS");

    expect(getRequiredFields(sheet, "exhaust", assigned())).toHaveLength(10);
    expect(getRequiredFields(sheet, "exhaust", assigned({ nox: true }))).toHaveLength(13);
    expect(
      getRequiredFields(sheet, "exhaust", assigned({ thc: true, nox: true, sox: true })),
    ).toHaveLength(17);
  });

  it("가스상 시트의 측정점은 유량 3칸만, 입자상은 등속흡인까지 필수다", () => {
    const gas = getRequiredFields(getDefaultSheetForm("GAS", 2), "point", assigned());
    const particle = getRequiredFields(getDefaultSheetForm("DUST", 2), "point", assigned());

    // 지점 2개 × 유량 3칸
    expect(gas).toHaveLength(6);
    // 지점 2개 × 10칸 + 시트 단위 2칸(노즐경·채취 시작시각)
    expect(particle).toHaveLength(22);
  });

  it("채취 항목이 없으면 가스상 물질 섹션은 채울 것이 없다", () => {
    expect(getRequiredFields(getDefaultSheetForm("GAS"), "gaseous", assigned())).toHaveLength(0);
  });
});

describe("getMissingRequiredFields", () => {
  it("기본값이 들어 있는 칸(O₂·CO₂·CO)은 미입력으로 잡지 않는다", () => {
    const missing = getMissingRequiredFields(getDefaultSheetForm("GAS"), "exhaust", assigned());

    // 필수 10칸 중 채워진 것은 3성분 9칸 — 남는 것은 가스분석기 시작시간뿐이다
    expect(missing).toEqual([fieldPath.exhaustTime("gasAnalyzerStartTime")]);
  });

  it("공백만 넣은 칸은 채운 것으로 보지 않는다", () => {
    const sheet = getDefaultSheetForm("GAS");
    const blank: SheetForm = { ...sheet, weather: { ...sheet.weather, pressure: "   " } };

    expect(getMissingRequiredFields(blank, "weather", assigned()))
      .toContain(fieldPath.weather("pressure"));
  });
});

describe("collectFieldPaths", () => {
  const paths = collectFieldPaths(getDefaultSheetForm("DUST", 2));

  it("필수가 아닌 칸도 전부 열거한다 — 불러온 값은 선택 입력에도 채워진다", () => {
    expect(paths).toContain(fieldPath.weather("windDirection"));
    expect(paths).toContain(fieldPath.moisture("samplingStartTime"));
  });

  it("자동 계산되는 채취 종료시각은 확인 대상이 아니라 뺀다", () => {
    expect(paths).not.toContain(fieldPath.particle("samplingEndTime"));
  });

  it("측정점은 개수만큼 늘어난다", () => {
    expect(paths.filter((path) => path.startsWith("points.1."))).toHaveLength(10);
  });
});

describe("getMissingBasicInfoFields", () => {
  it("총 채취시간 두 칸을 필수로 본다", () => {
    expect(getMissingBasicInfoFields(getDefaultBasicInfoForm())).toEqual([
      "samplingStartedAt",
      "samplingEndedAt",
    ]);
  });

  it("채운 칸은 빠진다", () => {
    const form = { ...getDefaultBasicInfoForm(), samplingStartedAt: "09:00" };

    expect(getMissingBasicInfoFields(form)).toEqual(["samplingEndedAt"]);
  });

  it("공백만 넣은 것은 채운 것이 아니다", () => {
    const form = { ...getDefaultBasicInfoForm(), samplingStartedAt: "  ", samplingEndedAt: "18:00" };

    expect(getMissingBasicInfoFields(form)).toEqual(["samplingStartedAt"]);
  });

  it("담당자는 필수가 아니다 — 비어 있어도 잡지 않는다", () => {
    const form = { ...getDefaultBasicInfoForm(), samplingStartedAt: "09:00", samplingEndedAt: "18:00" };

    expect(getMissingBasicInfoFields(form)).toEqual([]);
  });
});
