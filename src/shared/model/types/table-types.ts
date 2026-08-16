import type { RowData } from '@tanstack/react-table';

/**
 * TanStack 의 `TableMeta` 확장은 **전역 단일 선언**이다.
 * 위젯에서 각자 `declare module` 하면 그 키가 앱의 모든 테이블에 합쳐지고,
 * `TData` 가 아닌 특정 Row 타입으로 굳어져 다른 테이블에서 잘못된 타입이 통과한다.
 * 그래서 행 콜백은 여기서만, 반드시 `TData` 로 선언한다.
 */
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    /** 행 상세보기 액션 콜백. `useDataTable({ onViewDetail })` 이 주입하고 `RowActionCell` 이 읽는다. */
    onViewDetail?: (row: TData) => void;
    /** 행 다운로드 액션 콜백. `useDataTable({ overrides: { meta } })` 로 주입한다. */
    onDownload?: (row: TData) => void;
  }
}

/** 행 상세보기 콜백 시그니처 (위젯 훅 Props 타입에 재사용) */
export type RowDetailHandler<TData> = (row: TData) => void;
