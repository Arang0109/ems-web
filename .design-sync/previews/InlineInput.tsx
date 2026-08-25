import { useState } from "react";
import { InlineInput } from "ems-web";

/**
 * 라벨 없이 값만 놓는 좁은 입력. 표 셀·문장 사이처럼
 * 프레임을 호스트가 이미 그린 자리에 쓴다.
 */
export const Default = () => {
  const [value, setValue] = useState("1250");
  return <InlineInput value={value} onChange={setValue} width="8rem" />;
};

/** 앞뒤 슬롯 — 단위·기호를 입력창 안에 붙인다 */
export const WithPrefixSuffix = () => (
  <div className="flex flex-col items-start gap-3">
    <InlineInput value="6" onChange={() => {}} suffix="%" width="7rem" />
    <InlineInput value="45" onChange={() => {}} suffix="m" width="7rem" />
    <InlineInput value="1250" onChange={() => {}} prefix="Q" suffix="㎥/min" width="10rem" />
  </div>
);

/** 문장 안에 끼워 넣는 실제 쓰임 */
export const InSentence = () => (
  <div className="flex items-center gap-2 text-body-1">
    <span>표준산소농도</span>
    <InlineInput value="6" onChange={() => {}} suffix="%" width="6rem" />
    <span>로 보정</span>
  </div>
);

/** 읽기 전용·비활성 */
export const States = () => (
  <div className="flex flex-col items-start gap-3">
    <InlineInput value="18.72" onChange={() => {}} readOnly width="8rem" />
    <InlineInput value="" onChange={() => {}} placeholder="미입력" disabled width="8rem" />
  </div>
);
