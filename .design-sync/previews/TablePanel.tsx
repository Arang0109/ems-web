import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, EmptyText, Search, TablePanel } from "ems-web";

/** 제목 + 헤더 액션(검색·등록) + 하단 바를 갖춘 표 셸 */
export const Full = () => {
  const [filter, setFilter] = useState("");
  return (
    <TablePanel
      title="의뢰기관 목록"
      subtitle="한국환경공단 · 2026년 1분기"
      actions={
        <>
          <Search filter={filter} setFilter={setFilter} placeholder="의뢰기관, 주소 검색 ..." />
          <Button startIcon={Plus}>의뢰기관 등록</Button>
        </>
      }
      footer={<span className="text-body-3 text-muted-ink">전체 128건 중 1–20건</span>}
    >
      <div className="p-3 text-body-1">여기에 `BasicTable` 이 들어간다.</div>
    </TablePanel>
  );
};

/** 제목만 — `title`·`subtitle`·`actions` 가 모두 없으면 헤더 자체를 그리지 않는다 */
export const TitleOnly = () => (
  <TablePanel title="배출구 목록">
    <div className="p-3 text-body-1">본문</div>
  </TablePanel>
);

/** 상위 항목을 아직 고르지 않았을 때의 가드 분기 */
export const SelectionGuard = () => (
  <TablePanel title="배출구 목록" subtitle="사업장을 먼저 선택하세요">
    <EmptyText>왼쪽 목록에서 사업장을 선택하면 배출구가 표시됩니다.</EmptyText>
  </TablePanel>
);
