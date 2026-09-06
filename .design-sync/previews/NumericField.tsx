import { useState } from "react";
import { NumericField } from "ems-web";

/**
 * 숫자 입력. 확정값은 `value`(미입력은 `""`)이고,
 * 타이핑 중인 미완성 값(`-`, `1.`)은 컴포넌트 내부에만 있다.
 */
export const Default = () => {
  const [value, setValue] = useState("42.5");
  return (
    <div className="max-w-64">
      <NumericField label="측정값" value={value} onChange={setValue} />
    </div>
  );
};

/** 음수 허용 — ± 부호 버튼이 붙는다 */
export const AllowNegative = () => (
  <div className="flex max-w-64 flex-col gap-3">
    <span className="text-caption text-muted-ink">allowNegative — ± 부호 버튼이 붙는다</span>
    <NumericField label="온도" value="-12.4" onChange={() => {}} allowNegative step={0.1} />
    <span className="text-caption text-muted-ink">기본 — 양수만</span>
    <NumericField label="유량" value="1250" onChange={() => {}} step={10} />
  </div>
);

/**
 * 프레임 축 — `bordered`(기본)는 스스로 테두리를 그리고,
 * `none` 은 호스트(UnitField·표 셀)가 그린 프레임 안에 알맹이만 들어간다.
 */
export const Frames = () => (
  <div className="flex max-w-64 flex-col gap-3">
    <div className="flex flex-col gap-1">
      <span className="text-caption text-muted-ink">frame="bordered" (기본)</span>
      <NumericField label="측정값" value="6" onChange={() => {}} />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-caption text-muted-ink">frame="none" — 호스트가 그린 프레임 안</span>
      <div className="rounded-md border border-rule bg-surface px-2 py-1">
        <NumericField label="측정값" value="6" onChange={() => {}} frame="none" />
      </div>
    </div>
  </div>
);

/** 미입력·읽기 전용·비활성 */
export const States = () => (
  <div className="flex max-w-64 flex-col gap-3">
    <span className="text-caption text-muted-ink">미입력 (value="")</span>
    <NumericField label="측정값" value="" onChange={() => {}} placeholder="0.00" />
    <span className="text-caption text-muted-ink">읽기 전용 — 자동 계산 결과</span>
    <NumericField label="자동 계산 결과" value="18.72" onChange={() => {}} readOnly />
    <span className="text-caption text-muted-ink">비활성</span>
    <NumericField label="측정값" value="0" onChange={() => {}} disabled />
  </div>
);
