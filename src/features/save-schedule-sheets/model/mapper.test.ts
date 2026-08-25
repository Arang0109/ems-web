import { describe, expect, it } from "vitest";

import type { MeasurementSheet } from "@entities/schedule";

import { fromSheet, toSheetSave } from "./mapper";
import {
  getDefaultExhaustGasForm, getDefaultMoistureForm, getDefaultWeatherForm,
} from "./types";

// 서버가 실제로 내려주는 형태의 시트. 블록이 비어 오는 경우를 재현하려고 override 를 받는다.
const serverSheet = (over: Partial<MeasurementSheet> = {}): MeasurementSheet => ({
  category: "DUST",
  version: 3,
  weather: {
    pressure: 1013, weatherCondition: "CLEAR", temperature: 21.5, humidity: 40,
    windDirection: "NW", windSpeed: 1.2, pa: 760,
  },
  moisture: {
    weight: { before: 100, after: 105 },
    gasMeterTemperature: { in: 20, out: 22 },
    dryGasVolume: { before: 0, after: 30 },
    suctionVelocity: 10, gasMeterGaugePressure: 5,
    samplingStartTime: "09:00:00", samplingEndTime: "10:00:00",
    pm_g: null, tm_g: null, vm_g: null, ma: null, xw: null,
  },
  exhaustGas: {
    o2Concentration: [18.1, 18.3, 18.2], co2Concentration: [2, 2, 2],
    coConcentration: [0, 0, 0], noxConcentration: [], soxConcentration: [],
    gasAnalyzerStartTime: "09:10:00", thcAnalyzerStartTime: null,
    standardGasDensity: null, o2CorrectionFactor: null,
  },
  quantity: null,
  particle: {
    avgKFactor: null, avgOrificeDp: null, avgIsokineticRatio: null,
    totalVm: null, totalSamplingTime: null,
    samplingStartTime: "09:00:00", samplingEndTime: "10:00:00",
    thimbleFilter: "T-1", bgThimbleFilter: "B-1",
  },
  samplingPoints: [{
    Ts: 120, Pv: 3.5, Ps: -2, Vs: null, gasDensity: null,
    particle: {
      equipmentTemperature: { inTm: 20, outTm: 22, avgTm: null },
      equipmentVolume: { beforeVm: 0, afterVm: 30 },
      samplingTime: 30, vacuumGaugePressure: 50, finalImpingerTemperature: 15,
      nozzleSize: 0.6,
      Vm: null, Vlc: null, kFactor: null, orificeDp: null, isokineticRatio: null,
    },
  }],
  samples: [{
    sampleName: "시료1", startTime: "09:00:00", endTime: "10:00:00",
    suctionQuantity: 1, gasMeterGaugePressure: 2, inTemperature: 20, outTemperature: 22,
    beforeVolume: 0, afterVolume: 30, blankSampleNumber: "B-1", sampleNumber: "S-1",
    samplingVolume: 30,
  }],
  samplingPointCnt: 1,
  avgTm: null,
  ...over,
});

describe("fromSheet — 서버가 블록을 비워 보낼 때", () => {
  // 이전 회차 불러오기(SheetReuse)는 그 회차에만 유효한 기상 조건을 비우고 대기압만 남긴다.
  // 남길 대기압조차 없던 회차는 필드가 아니라 weather 블록째 null 로 내려온다.
  it("weather 가 null 이어도 던지지 않고 기본 기상 폼으로 채운다", () => {
    const form = fromSheet(serverSheet({ weather: null }));

    expect(form.weather).toEqual(getDefaultWeatherForm());
    // 나머지 블록은 그대로 읽혀야 한다 — 불러오기의 목적이 이 값들이다.
    expect(form.samplingPoints[0].Ts).toBe("120");
  });

  it("대기압만 남은 기상 블록은 대기압만 채우고 나머지는 빈 값으로 둔다", () => {
    const form = fromSheet(serverSheet({
      weather: {
        pressure: 1013, weatherCondition: null, temperature: null,
        humidity: null, windDirection: null, windSpeed: null, pa: null,
      },
    }));

    expect(form.weather).toEqual({ ...getDefaultWeatherForm(), pressure: "1013" });
  });

  it("moisture 가 null 이어도 기본 수분 폼으로 채운다", () => {
    expect(fromSheet(serverSheet({ moisture: null })).moisture)
      .toEqual(getDefaultMoistureForm());
  });

  it("exhaustGas 가 null 이어도 기본 배출가스 폼으로 채운다", () => {
    expect(fromSheet(serverSheet({ exhaustGas: null })).exhaustGas)
      .toEqual(getDefaultExhaustGasForm());
  });

  it("측정점·시료 목록이 null 이어도 빈 배열이 된다", () => {
    const form = fromSheet(serverSheet({ samplingPoints: null, samples: null }));

    expect(form.samplingPoints).toEqual([]);
    expect(form.samples).toEqual([]);
  });

  it("모든 블록이 비어도 던지지 않는다", () => {
    expect(() => fromSheet(serverSheet({
      weather: null, moisture: null, exhaustGas: null,
      particle: null, samplingPoints: null, samples: null,
    }))).not.toThrow();
  });
});

describe("fromSheet — 정상 시트", () => {
  it("입력값을 폼 문자열로 옮긴다", () => {
    const form = fromSheet(serverSheet());

    expect(form.weather.pressure).toBe("1013");
    expect(form.weather.weatherCondition).toBe("CLEAR");
    // 시각은 초를 떼고 "HH:mm" 으로 보여준다.
    expect(form.moisture.samplingStartTime).toBe("09:00");
    expect(form.exhaustGas.o2).toEqual(["18.1", "18.3", "18.2"]);
    // 노즐경은 측정점별 저장이지만 폼은 시트당 1개다.
    expect(form.particle.nozzleSize).toBe("0.6");
  });

  it("toSheetSave 로 되돌리면 입력값이 보존된다", () => {
    const saved = toSheetSave(fromSheet(serverSheet()));

    expect(saved.weather.pressure).toBe(1013);
    expect(saved.moisture.weight).toEqual({ before: 100, after: 105 });
    expect(saved.samplingPoints[0].Ts).toBe(120);
    expect(saved.samples[0].sampleNumber).toBe("S-1");
    // 계산결과는 서버 소유이므로 되돌려 보내지 않는다.
    expect(saved.weather.pa).toBeNull();
    expect(saved.quantity).toBeNull();
  });

  it("빈 블록을 거쳐도 저장 요청은 블록을 채워 보낸다", () => {
    const saved = toSheetSave(fromSheet(serverSheet({ weather: null })));

    expect(saved.weather.pressure).toBeNull();
    expect(saved.weather.weatherCondition).toBeNull();
  });
});
