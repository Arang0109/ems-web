import { useState } from "react";
import { HorizontalRadioGroup } from "ems-web";

const SHAPES = [
  { value: "CIRCULAR", label: "원형" },
  { value: "RECTANGULAR", label: "사각형" },
  { value: "ETC", label: "기타" },
];

/** 선택 상태 */
export const Default = () => {
  const [value, setValue] = useState("CIRCULAR");
  return <HorizontalRadioGroup options={SHAPES} value={value} onValueChange={setValue} />;
};

/** 개별 옵션 비활성 */
export const WithDisabledOption = () => (
  <HorizontalRadioGroup
    value="AIR"
    options={[
      { value: "AIR", label: "대기" },
      { value: "WATER", label: "수질" },
      { value: "NOISE", label: "소음·진동", disabled: true },
    ]}
  />
);

/** 그룹 전체 비활성 */
export const Disabled = () => (
  <HorizontalRadioGroup options={SHAPES} value="RECTANGULAR" disabled />
);

/** 폼 필드로서의 실제 배치 — 라벨은 호출부가 얹는다 */
export const InForm = () => (
  <div className="flex flex-col gap-1">
    <span className="text-label text-muted-ink">배출구 형상</span>
    <HorizontalRadioGroup options={SHAPES} value="CIRCULAR" />
  </div>
);
