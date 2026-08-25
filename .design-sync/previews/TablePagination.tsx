import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TablePagination } from "ems-web";

interface Row {
  name: string;
  field: string;
}

const columnHelper = createColumnHelper<Row>();
const columns = [
  columnHelper.accessor("name", { header: "배출구명" }),
  columnHelper.accessor("field", { header: "측정분야" }),
];

const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({
    name: `${i + 1}호기 배출구`,
    field: i % 2 ? "수질" : "대기",
  }));

/**
 * TanStack Table 인스턴스에서 페이지 상태를 직접 읽는다 —
 * `Pagination` 과 달리 페이지 수·이동 가능 여부를 넘길 필요가 없다.
 */
const useDemoTable = (rowCount: number, pageIndex = 0, pageSize = 10) =>
  useReactTable({
    data: makeRows(rowCount),
    columns,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: () => {},
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

export const Middle = () => <TablePagination table={useDemoTable(128, 4)} />;

/** 첫 페이지 */
export const FirstPage = () => <TablePagination table={useDemoTable(128, 0)} />;
