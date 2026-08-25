import { useState } from "react";
import { Search } from "ems-web";

/**
 * 표 상단 검색 필드. `filter`/`setFilter` 는 TanStack Table 의
 * `globalFilter` 상태를 그대로 받는 자리다.
 */
export const Default = () => {
  const [filter, setFilter] = useState("");
  return <Search filter={filter} setFilter={setFilter} placeholder="의뢰기관, 주소 검색 ..." />;
};

/** 입력값이 있는 상태 */
export const Filled = () => {
  const [filter, setFilter] = useState("한국환경공단");
  return <Search filter={filter} setFilter={setFilter} placeholder="의뢰기관, 주소 검색 ..." />;
};

/** 패널 헤더 액션 슬롯에서의 실제 배치 */
export const InPanelHeader = () => {
  const [filter, setFilter] = useState("");
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rule p-3">
      <span className="text-h3">의뢰기관 목록</span>
      <Search filter={filter} setFilter={setFilter} placeholder="의뢰기관, 주소 검색 ..." />
    </div>
  );
};
