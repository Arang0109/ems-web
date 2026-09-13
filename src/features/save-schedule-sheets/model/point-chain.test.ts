import { describe, expect, it } from "vitest";

import { getDefaultSamplingPointForm } from "./types";
import type { SamplingPointForm } from "./types";
import { appendPoint, applyPointPatch, copyPreviousPointValues } from "./point-chain";

const point = (patch: Partial<SamplingPointForm> = {}): SamplingPointForm => ({
  ...getDefaultSamplingPointForm(),
  ...patch,
});

describe("applyPointPatch — 채취시간", () => {
  it("어느 지점에 입력하든 전 지점이 같은 값을 갖는다", () => {
    const points = [point(), point(), point()];

    const next = applyPointPatch(points, 1, { samplingTime: "30" });

    expect(next.map((p) => p.samplingTime)).toEqual(["30", "30", "30"]);
  });

  it("지우는 것도 함께 간다 — 한 지점만 빈 채로 남지 않는다", () => {
    const points = [point({ samplingTime: "30" }), point({ samplingTime: "30" })];

    const next = applyPointPatch(points, 0, { samplingTime: "" });

    expect(next.map((p) => p.samplingTime)).toEqual(["", ""]);
  });

  it("다른 항목을 고칠 때는 그 지점만 바뀐다", () => {
    const points = [point({ Ts: "100" }), point({ Ts: "200" })];

    const next = applyPointPatch(points, 0, { Ts: "150" });

    expect(next.map((p) => p.Ts)).toEqual(["150", "200"]);
  });
});

describe("applyPointPatch — DGM 적산값", () => {
  it("채취량-후를 입력하면 다음 지점의 채취량-전이 이어받는다", () => {
    const points = [point(), point()];

    const next = applyPointPatch(points, 0, { afterVm: "1.234" });

    expect(next[1].beforeVm).toBe("1.234");
  });

  it("이어받은 그대로인 칸은 앞 값을 고칠 때 따라 옮긴다", () => {
    const points = [point({ afterVm: "1.2" }), point({ beforeVm: "1.2" })];

    const next = applyPointPatch(points, 0, { afterVm: "1.23" });

    expect(next[1].beforeVm).toBe("1.23");
  });

  it("손으로 고쳐 둔 채취량-전은 지킨다 — 미터를 초기화한 현장이 있다", () => {
    const points = [point({ afterVm: "1.2" }), point({ beforeVm: "0" })];

    const next = applyPointPatch(points, 0, { afterVm: "1.23" });

    expect(next[1].beforeVm).toBe("0");
  });

  it("마지막 지점의 채취량-후는 이어받을 곳이 없다", () => {
    const points = [point(), point()];

    const next = applyPointPatch(points, 1, { afterVm: "2.5" });

    expect(next.map((p) => p.beforeVm)).toEqual(["", ""]);
  });

  it("채취량-전은 그 지점에만 적용된다 — 앞 지점을 거슬러 올라가지 않는다", () => {
    const points = [point({ afterVm: "1.2" }), point({ beforeVm: "1.2" })];

    const next = applyPointPatch(points, 1, { beforeVm: "0" });

    expect(next[0].afterVm).toBe("1.2");
    expect(next[1].beforeVm).toBe("0");
  });
});

describe("appendPoint", () => {
  it("채취시간과 채취량-전을 규칙대로 채운 지점을 붙인다", () => {
    const points = [point({ samplingTime: "30", afterVm: "1.5" })];

    const next = appendPoint(points);

    expect(next).toHaveLength(2);
    expect(next[1].samplingTime).toBe("30");
    expect(next[1].beforeVm).toBe("1.5");
  });

  it("첫 지점을 만들 때는 이어받을 값이 없다", () => {
    const next = appendPoint([]);

    expect(next).toEqual([getDefaultSamplingPointForm()]);
  });
});

describe("copyPreviousPointValues", () => {
  it("DGM 채취량 두 칸을 뺀 나머지를 앞 지점에서 베낀다", () => {
    const points = [
      point({ Ts: "150", Pv: "3.2", samplingTime: "30", beforeVm: "0.5", afterVm: "1.5" }),
      point(),
    ];

    const next = copyPreviousPointValues(points, 1);

    expect(next[1].Ts).toBe("150");
    expect(next[1].Pv).toBe("3.2");
    expect(next[1].samplingTime).toBe("30");
    // 앞 지점의 채취량-전(0.5)을 베끼지 않고 채취량-후(1.5)를 잇는다
    expect(next[1].beforeVm).toBe("1.5");
    expect(next[1].afterVm).toBe("");
  });

  it("이미 읽어 둔 채취량-후는 불러오기가 덮지 않는다", () => {
    const points = [
      point({ beforeVm: "0.5", afterVm: "1.5" }),
      point({ beforeVm: "1.5", afterVm: "2.5" }),
    ];

    const next = copyPreviousPointValues(points, 1);

    expect(next[1].beforeVm).toBe("1.5");
    expect(next[1].afterVm).toBe("2.5");
  });

  it("첫 지점에는 불러올 앞 지점이 없다", () => {
    const points = [point({ Ts: "150" })];

    expect(copyPreviousPointValues(points, 0)).toBe(points);
  });
});
