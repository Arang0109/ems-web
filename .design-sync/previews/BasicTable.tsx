import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { BasicTable } from "ems-web";

interface ClientRow {
  name: string;
  representative: string;
  address: string;
  bizNumber: string;
}

const columnHelper = createColumnHelper<ClientRow>();

// 실제 위젯(`widgets/client-table`)의 컬럼 정의와 같은 형태다.
const columns = [
  columnHelper.accessor("name", { header: "측정대행 의뢰기관" }),
  columnHelper.accessor("representative", { header: "대표자명" }),
  columnHelper.accessor("address", { header: "측정대행 의뢰기관 주소" }),
  columnHelper.accessor("bizNumber", { header: "사업자번호" }),
];

const rows: ClientRow[] = [
  {
    name: "한국환경공단",
    representative: "김민수",
    address: "인천광역시 서구 환경로 42",
    bizNumber: "123-45-67890",
  },
  {
    name: "대한제철 포항공장",
    representative: "박지훈",
    address: "경상북도 포항시 남구 철강로 118",
    bizNumber: "506-81-22143",
  },
  {
    name: "그린에너지발전",
    representative: "최유진",
    address: "충청남도 당진시 석문면 대호만로 900",
    bizNumber: "312-86-55210",
  },
];

/**
 * `BasicTable` 은 TanStack Table 인스턴스를 받는다.
 * 앱에서는 `useDataTable`(shared/model)이 정렬·검색·페이지네이션까지 배선하지만,
 * 최소 구성은 `useReactTable` + `getCoreRowModel` 이면 된다.
 */
const useDemoTable = (data: ClientRow[]) =>
  useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

export const Default = () => (
  <BasicTable table={useDemoTable(rows)} mobileCard={false} />
);

/** 행이 0건일 때 — `emptyState` 미지정 시 기본 문구가 나온다 */
export const Empty = () => (
  <BasicTable
    table={useDemoTable([])}
    mobileCard={false}
    emptyState="등록된 의뢰기관이 없습니다."
  />
);

/** 로딩 중 — 빈 상태 문구 대신 로딩 표시로 바뀐다 */
export const Loading = () => (
  <BasicTable table={useDemoTable([])} mobileCard={false} loading />
);

/** 조회 실패 */
export const ErrorState = () => (
  <BasicTable
    table={useDemoTable([])}
    mobileCard={false}
    error="의뢰기관 목록을 불러오지 못했습니다."
  />
);
