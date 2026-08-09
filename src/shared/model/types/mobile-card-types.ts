import type { ReactNode } from 'react';
import type { Table } from '@tanstack/react-table';

/**
 * 카드 한 조각의 내용.
 *
 * - `string` : 컬럼 id — 해당 컬럼의 `columnDef.cell` 을 그대로 재사용한다(배지·링크 셀 보존)
 * - 함수     : 완전 커스텀. 문자열을 반환하면 카드 기본 타이포가 적용된다
 */
export type CardContent<TData> =
  | string
  | ((row: TData, table: Table<TData>) => ReactNode);

/** 카드 본문 2열 그리드의 한 칸 */
export interface MobileCardField<TData> {
  /** 미지정이고 `content` 가 컬럼 id 면 해당 컬럼의 문자열 header 로 폴백 */
  label?: string;
  content: CardContent<TData>;
  /** 두 칸 모두 차지 */
  fullWidth?: boolean;
}

/**
 * 행 하나를 모바일 카드로 어떻게 그릴지 선언한다.
 *
 * 컬럼 정의(`columns.ts`)와 분리된 별도 선언이므로 카드 전용 필드·라벨·버튼을
 * 자유롭게 구성할 수 있다. 미지정 위젯은 `deriveCardConfig` 의 자동 배치를 따른다.
 */
export interface MobileCardConfig<TData> {
  title?: CardContent<TData>;
  subtitle?: CardContent<TData>;
  status?: CardContent<TData>;
  /**
   * 헤더 우측 버튼 영역. 여러 개면 배열로 넘긴다.
   * 컬럼 id 를 주면 `RowActionCell` 같은 기존 액션 셀을 그대로 재사용할 수 있다.
   * 카드 클릭 전파 차단은 `MobileCardList` 가 책임진다.
   */
  actions?: CardContent<TData> | CardContent<TData>[];
  fields?: MobileCardField<TData>[];
}
