import { useState } from "react";
import { DateRangePicker } from "ems-web";

/** 트리거형 — 기간이 선택된 상태 */
export const Selected = () => {
  const [range, setRange] = useState({
    from: new Date(2026, 2, 2),
    to: new Date(2026, 2, 13),
  });
  return (
    <div className="max-w-sm">
      <DateRangePicker
        label="측정 기간"
        value={range}
        onChange={(next) => next && setRange(next)}
        required
      />
    </div>
  );
};

/** 미선택 */
export const Empty = () => (
  <div className="max-w-sm">
    <DateRangePicker label="조회 기간" placeholder="기간 선택" helperText="비우면 전체 기간을 조회합니다." />
  </div>
);

/**
 * `inline` — 트리거 없이 달력을 그대로 편다.
 * 이미 팝오버 안에 놓이는 필터에서 팝오버 중첩을 피할 때 쓴다.
 */
export const Inline = () => (
  <DateRangePicker
    inline
    numberOfMonths={1}
    value={{ from: new Date(2026, 2, 2), to: new Date(2026, 2, 13) }}
  />
);
