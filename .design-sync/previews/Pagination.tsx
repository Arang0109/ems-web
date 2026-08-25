import { useState } from "react";
import { Pagination } from "ems-web";

/**
 * 페이지 이동. 폭은 내용에 맞고 정렬은 부모가 정한다 —
 * 전체 폭 가운데 정렬이 필요하면 `className="w-full justify-center"` 를 넘긴다.
 */
export const Middle = () => {
  const [page, setPage] = useState(4);
  const pageCount = 12;
  return (
    <Pagination
      pageIndex={page}
      pageCount={pageCount}
      canPreviousPage={page > 0}
      canNextPage={page < pageCount - 1}
      onPreviousPage={() => setPage((p) => p - 1)}
      onNextPage={() => setPage((p) => p + 1)}
      onPageChange={setPage}
    />
  );
};

/** 첫 페이지 — 이전 버튼이 비활성된다 */
export const FirstPage = () => (
  <Pagination
    pageIndex={0}
    pageCount={12}
    canPreviousPage={false}
    canNextPage
    onPreviousPage={() => {}}
    onNextPage={() => {}}
    onPageChange={() => {}}
  />
);

/** 전체 폭 가운데 정렬 */
export const CenteredFullWidth = () => (
  <Pagination
    className="w-full justify-center"
    pageIndex={2}
    pageCount={8}
    canPreviousPage
    canNextPage
    onPreviousPage={() => {}}
    onNextPage={() => {}}
    onPageChange={() => {}}
  />
);
