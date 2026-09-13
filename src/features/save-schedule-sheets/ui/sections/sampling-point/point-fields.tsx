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
}

/** 유량 정보 — 모든 시트가 입력한다(유속·유량 계산의 입력). */
export const FLOW_FIELDS: PointField[] = [
  {
    field: "Ts", label: "배출가스 온도", name: "배출가스온도",
    unit: "°C", step: 0.1,
    // 상온·저온 배출구는 외기보다 찰 수 있어 음수를 막지 않는다
    min: undefined,
    className: "col-span-2",
  },
  {
    field: "Pv", label: "동압", name: "동압",
    unit: "mmH₂O", step: 0.1,
    // 동압 = ½ρv² — 정의상 음수가 성립하지 않는다
    min: 0,
  },
  {
    field: "Ps", label: "정압", name: "정압",
    unit: "mmH₂O", step: 0.1,
    // 흡인식 굴뚝은 안이 대기압보다 낮아 음압(-)이 정상값이다
    min: undefined,
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
  },
  {
    field: "outTm", label: "DGM 출구온도", name: "건식가스미터 출구온도", unit: "°C", step: 0.1,
    min: undefined,   // 위와 같음
  },
  {
    field: "samplingTime", label: "채취시간", name: "채취시간", unit: "분",
    min: 0, className: "col-span-2",   // 채취시간은 0분 이상만 성립한다
  },
  {
    field: "beforeVm", label: "채취량-전", name: "흡입량 전", unit: "m³", step: 0.00001,
    min: 0,           // 가스미터 적산값
  },
  {
    field: "afterVm", label: "채취량-후", name: "흡입량 후", unit: "m³", step: 0.00001,
    min: 0,           // 가스미터 적산값
  },
  {
    field: "vacuumGaugePressure", label: "진공게이지압", name: "진공게이지압", unit: "mmHg",
    min: 0,   // 진공게이지압
  },
  {
    field: "finalImpingerTemperature", label: "최종임핀저 출구온도", name: "최종임핀저 출구온도",
    unit: "°C", step: 0.1,
    min: undefined,   // 임핀저는 얼음물로 냉각한다 — 0°C 근처·이하가 정상이다
  },
];

/** 채취량(V<sub>m</sub>) 결과 행이 끼어드는 위치 — 이 항목 **뒤**에 온다 */
export const VM_RESULT_AFTER: PointField["field"] = "afterVm";

/** 노즐 기준선(`NozzleBasisNote`)이 끼어드는 위치 — 채취시간 **뒤**에 온다 */
export const NOZZLE_BASIS_AFTER: PointField["field"] = "samplingTime";
