import type { ReactNode } from "react";

import type { SamplingPointForm } from "../../../model/types";

/**
 * 측정점 입력 한 칸의 스펙. 모바일 카드(`UnitField`)와 데스크탑 전치 표(`TableInputCell`)가
 * 같은 배열을 읽으므로, 항목별 차이는 전부 여기서만 선언한다.
 */
export interface PointField {
  field: keyof SamplingPointForm;
  label: ReactNode;
  /** 라벨이 JSX·조합 문자열이라 그대로 못 쓰는 자리 — 도움말 아이콘의 접근성 이름 */
  name: string;
  unit: string;
  /** ↑/↓ 증감 폭. 정수로 읽는 항목은 생략한다 */
  step?: number;
  className?: string;
  /**
   * 값의 하한 — **모든 항목이 명시한다(선택 속성이 아니다).**
   *
   * 생략을 허용하면 "이 항목에 음수가 성립하는가"를 아무도 판단하지 않은 채
   * ± 버튼이 붙는다. 실제로 동압(ΔP)에 그 일이 있었다.
   *
   * - `0`  → ± 버튼이 빠지고 `-` 입력도 막힌다
   * - `undefined` → "음수가 정상값" 이라는 명시적 선언이다. 반드시 근거를 주석으로 남긴다
   */
  min: number | undefined;
  /**
   * 정수부·소수부 최대 자릿수 — **모든 항목이 명시한다(선택 속성이 아니다).**
   *
   * `min` 과 같은 이유다. 생략을 허용하면 "이 항목이 몇 자리까지 나오는가" 를 아무도
   * 판단하지 않은 채 무제한이 된다. 항목마다 **물리·계측 범위**를 근거로 적는다.
   *
   * 값을 막는 장치가 아니다 — 범위 검증은 validator 몫이고, 여기서는 오타 한 자리
   * (`35.0` → `350.0`)가 아예 안 들어가게 하는 것이 목적이다.
   * 부호와 선행 0 은 자릿수에 세지 않는다 — `-999.9` 는 `maxIntDigits: 3` 을 통과한다.
   */
  maxIntDigits: number;
  maxDecimals: number;
}

/** 유량 정보 — 모든 시트가 입력한다(유속·유량 계산의 입력). */
export const FLOW_FIELDS: PointField[] = [
  {
    field: "Ts", label: "배출가스 온도", name: "배출가스온도",
    unit: "°C", step: 0.1,
    // 상온·저온 배출구는 외기보다 찰 수 있어 음수를 막지 않는다
    min: undefined,
    // 소각로 배출구도 999.9°C 를 넘지 않는다
    maxIntDigits: 3, maxDecimals: 1,
    className: "col-span-2",
  },
  {
    field: "Pv", label: "동압", name: "동압",
    unit: "mmH₂O", step: 0.1,
    // 동압 = ½ρv² — 정의상 음수가 성립하지 않는다
    min: 0,
    // 굴뚝 동압은 수십 mmH₂O — 세 자리면 이미 이상값이다
    maxIntDigits: 3, maxDecimals: 1,
  },
  {
    field: "Ps", label: "정압", name: "정압",
    unit: "mmH₂O", step: 0.1,
    // 흡인식 굴뚝은 안이 대기압보다 낮아 음압(-)이 정상값이다
    min: undefined,
    // 부호는 자릿수에 세지 않으므로 `-999.9` 까지 들어간다
    maxIntDigits: 3, maxDecimals: 1,
  },
];

/**
 * 등속흡인 정보 — 입자상 전용.
 *
 * 시안의 입력 순서(… 흡입량 → **채취량** → 진공게이지압 …)에서 채취량은 입력이 아니라
 * 자동계산 결과다. 배열을 앞뒤로 쪼개 그 자리를 표현하면 "등속흡인 = 배열 하나" 라는
 * 대응이 깨지므로, 끼어드는 위치만 아래 상수로 따로 둔다.
 */
export const ISOKINETIC_FIELDS: PointField[] = [
  {
    field: "inTm", label: "DGM 입구온도", name: "건식가스미터 입구온도", unit: "°C", step: 0.1,
    min: undefined,   // 가스미터를 지난 가스는 외기 온도까지 내려간다
    maxIntDigits: 3, maxDecimals: 1,   // 외기~수백 °C
  },
  {
    field: "outTm", label: "DGM 출구온도", name: "건식가스미터 출구온도", unit: "°C", step: 0.1,
    min: undefined,   // 위와 같음
    maxIntDigits: 3, maxDecimals: 1,
  },
  {
    field: "samplingTime", label: "채취시간", name: "채취시간", unit: "분",
    min: 0, className: "col-span-2",   // 채취시간은 0분 이상만 성립한다
    // 지점당 999분(16시간)을 넘지 않는다. 소수는 현장에서 반 분 단위를 적는 경우가
    // 있는지 확인되기 전까지 한 자리 남겨 둔다 — 막아서 못 적는 쪽이 더 나쁘다.
    maxIntDigits: 3, maxDecimals: 1,
  },
  {
    field: "beforeVm", label: "채취량-전", name: "흡입량 전", unit: "m³", step: 0.00001,
    min: 0,           // 가스미터 적산값
    maxIntDigits: 4, maxDecimals: 5,   // 적산 4자리 + 눈금 1/100,000 m³
  },
  {
    field: "afterVm", label: "채취량-후", name: "흡입량 후", unit: "m³", step: 0.00001,
    min: 0,           // 가스미터 적산값
    maxIntDigits: 4, maxDecimals: 5,
  },
  {
    field: "vacuumGaugePressure", label: "진공게이지압", name: "진공게이지압", unit: "mmHg",
    min: 0,   // 진공게이지압
    maxIntDigits: 3, maxDecimals: 1,   // 완전진공이 760 mmHg — 세 자리가 물리 상한이다
  },
  {
    field: "finalImpingerTemperature", label: "최종임핀저 출구온도", name: "최종임핀저 출구온도",
    unit: "°C", step: 0.1,
    min: undefined,   // 임핀저는 얼음물로 냉각한다 — 0°C 근처·이하가 정상이다
    maxIntDigits: 2, maxDecimals: 1,   // 냉각된 가스라 두 자리를 넘는 온도는 오타다
  },
];

/** 채취량(V<sub>m</sub>) 결과 행이 끼어드는 위치 — 이 항목 **뒤**에 온다 */
export const VM_RESULT_AFTER: PointField["field"] = "afterVm";

/** 노즐 기준선(`NozzleBasisNote`)이 끼어드는 위치 — 채취시간 **뒤**에 온다 */
export const NOZZLE_BASIS_AFTER: PointField["field"] = "samplingTime";
