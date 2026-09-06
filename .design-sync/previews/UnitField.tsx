import { useState } from "react";
import { UnitField } from "ems-web";

/** 단위 박스가 붙은 기본형 */
export const WithUnit = () => {
  const [value, setValue] = useState("45");
  return (
    <div className="max-w-sm">
      <UnitField label="배출구 높이" value={value} onChange={setValue} unit="m" required />
    </div>
  );
};

/** 라벨 옆 도움말 — 용어 설명처럼 상시 노출하기엔 긴 안내 */
export const WithHint = () => (
  <div className="max-w-sm">
    <UnitField
      label="표준산소농도"
      hintLabel="표준산소농도 설명"
      hint="측정값을 동일 기준으로 비교하기 위한 보정 산소농도입니다."
      value="6"
      unit="%"
    />
  </div>
);

/** `options` 를 주면 같은 프레임으로 Select 모드가 된다 */
export const SelectMode = () => (
  <div className="max-w-sm">
    <UnitField
      label="배출구 형상"
      value="CIRCULAR"
      options={[
        { value: "CIRCULAR", label: "원형" },
        { value: "RECTANGULAR", label: "사각형" },
      ]}
    />
  </div>
);

/** 상태 색 — 의미는 호출부가 정하고, 우측 아이콘도 함께 갈려 색 없이도 읽힌다 */
export const Tones = () => (
  <div className="flex max-w-sm flex-col gap-3">
    <UnitField label="측정값 (정상)" value="42.5" unit="ppm" showComplete />
    <UnitField label="측정값 (확인 필요)" value="0" unit="ppm" tone="info" />
    <UnitField label="측정값 (기준 초과)" value="812.0" unit="ppm" tone="danger" />
    <UnitField label="자동 계산 결과" value="18.72" unit="ppm" readOnly />
  </div>
);
