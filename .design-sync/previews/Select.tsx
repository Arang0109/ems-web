import { useState } from "react";
import { Select } from "ems-web";

const FIELDS = [
  { value: "AIR", label: "대기" },
  { value: "WATER", label: "수질" },
  { value: "NOISE", label: "소음·진동" },
  { value: "ODOR", label: "악취" },
];

/** 라벨 + 도움말이 붙은 기본형 */
export const WithLabel = () => {
  const [value, setValue] = useState("AIR");
  return (
    <div className="max-w-sm">
      <Select
        label="측정분야"
        options={FIELDS}
        value={value}
        onValueChange={(v) => setValue(v ?? "")}
        helperText="배출구가 속한 측정분야를 고릅니다."
        required
      />
    </div>
  );
};

/** 미선택 상태 — 값이 `""` 면 placeholder 가 보인다 */
export const Placeholder = () => (
  <div className="max-w-sm">
    <Select label="담당 팀" options={FIELDS} value="" placeholder="팀을 선택하세요" />
  </div>
);

/** 그룹 옵션 — `groups` 로 구분선과 그룹 라벨이 생긴다 */
export const Grouped = () => (
  <div className="max-w-sm">
    <Select
      label="측정 항목"
      value="TSP"
      groups={[
        {
          label: "입자상",
          options: [
            { value: "TSP", label: "먼지(TSP)" },
            { value: "PM10", label: "미세먼지(PM-10)" },
          ],
        },
        {
          label: "가스상",
          options: [
            { value: "SO2", label: "황산화물(SO₂)" },
            { value: "NOX", label: "질소산화물(NOx)" },
            { value: "CO", label: "일산화탄소(CO)", disabled: true },
          ],
        },
      ]}
    />
  </div>
);

/** size 축과 비활성 */
export const SizesAndDisabled = () => (
  <div className="flex max-w-sm flex-col gap-3">
    <Select label="기본" options={FIELDS} value="AIR" />
    <Select label="작게 (size=sm)" options={FIELDS} value="WATER" size="sm" />
    <Select label="비활성" options={FIELDS} value="AIR" disabled />
  </div>
);
