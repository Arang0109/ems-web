import { useState } from "react";
import { Checkbox } from "ems-web";

/** 라벨이 붙은 기본형 */
export const WithLabel = () => {
  const [checked, setChecked] = useState(true);
  return <Checkbox label="성적서 발행 시 알림 받기" checked={checked} onChange={setChecked} />;
};

/** 상태 축 — 선택/해제/비활성 */
export const States = () => (
  <div className="flex flex-col gap-3">
    <Checkbox label="선택됨" checked onChange={() => {}} />
    <Checkbox label="해제됨" checked={false} onChange={() => {}} />
    <Checkbox label="비활성 (선택됨)" checked disabled />
    <Checkbox label="비활성 (해제됨)" checked={false} disabled />
  </div>
);

/** 목록에서의 실제 쓰임 — 성적서에 실을 측정항목 고르기 */
export const InList = () => {
  const [picked, setPicked] = useState<string[]>(["TSP", "SO2"]);
  const toggle = (v: string) =>
    setPicked((prev) => (prev.includes(v) ? prev.filter((p) => p !== v) : [...prev, v]));

  return (
    <div className="flex flex-col gap-3">
      {[
        { value: "TSP", label: "먼지(TSP)" },
        { value: "SO2", label: "황산화물(SO₂)" },
        { value: "NOX", label: "질소산화물(NOx)" },
        { value: "CO", label: "일산화탄소(CO)" },
      ].map((item) => (
        <Checkbox
          key={item.value}
          label={item.label}
          checked={picked.includes(item.value)}
          onChange={() => toggle(item.value)}
        />
      ))}
    </div>
  );
};
