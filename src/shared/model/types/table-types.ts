import type { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    /** 행 상세보기 액션 콜백. `useDataTable({ onViewDetail })` 이 주입하고 `RowActionCell` 이 읽는다. */
    onViewDetail?: (row: TData) => void;
  }
}

/** 행 상세보기 콜백 시그니처 (위젯 훅 Props 타입에 재사용) */
export type RowDetailHandler<TData> = (row: TData) => void;
