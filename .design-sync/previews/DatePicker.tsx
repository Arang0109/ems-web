import { useState } from "react";
import { DatePicker } from "ems-web";

/** 값이 선택된 상태 */
export const Selected = () => {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 2, 14));
  return (
    <div className="max-w-sm">
      <DatePicker label="측정 예정일" value={date} onChange={setDate} required />
    </div>
  );
};

/** 미선택 — placeholder 가 보인다 */
export const Empty = () => (
  <div className="max-w-sm">
    <DatePicker
      label="성적서 발행일"
      placeholder="발행일 선택"
      helperText="발행 후에는 값을 수정할 수 없습니다."
    />
  </div>
);

/** 비활성 */
export const Disabled = () => (
  <div className="max-w-sm">
    <DatePicker label="계약 시작일" value={new Date(2026, 0, 1)} disabled />
  </div>
);
