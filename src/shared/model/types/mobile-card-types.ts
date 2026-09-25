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

/** 카드 본문 그리드의 열 수 */
export type MobileCardColumns = 1 | 2 | 3;

/** 카드 본문 그리드의 한 칸 */
export interface MobileCardField<TData> {
  /** 미지정이고 `content` 가 컬럼 id 면 해당 컬럼의 문자열 header 로 폴백 */
  label?: string;
  content: CardContent<TData>;
  /** 차지할 열 수. `'full'` 은 열 수와 무관하게 행 전체. 기본 1 */
  span?: MobileCardColumns | 'full';
}

/**
 * 행 하나를 모바일 카드로 어떻게 그릴지 선언한다.
 *
 * 컬럼 정의(`columns.ts`)와 분리된 별도 선언이므로 카드 전용 필드·라벨·버튼을
 * 자유롭게 구성할 수 있다. 미지정 위젯은 `deriveCardConfig` 의 자동 배치를 따른다.
 */
export interface MobileCardConfig<TData> {
  /** 제목 **위**에 얹는 배지 슬롯 — "오늘" 처럼 행을 한 단어로 표식할 때 */
  badge?: CardContent<TData>;
  title?: CardContent<TData>;
  /** 제목 타이포 덮어쓰기. 기본 `text-h3` — 제목이 카드의 키인 시안(예: 측정계획 `text-h2`)에서만 쓴다 */
  titleClassName?: string;
  subtitle?: CardContent<TData>;
  status?: CardContent<TData>;
  /**
   * 카드 강조(브랜드 테두리). `isRowSelected`(선택 상태)와 **별개 축**이라
   * 배경은 건드리지 않는다 — 둘이 동시에 걸려도 서로 구분된다.
   */
  highlight?: (row: TData) => boolean;
  /**
   * 헤더 우측 버튼 영역. 여러 개면 배열로 넘긴다.
   * 컬럼 id 를 주면 `RowActionCell` 같은 기존 액션 셀을 그대로 재사용할 수 있다.
   * 카드 클릭 전파 차단은 `MobileCardList` 가 책임진다.
   */
  actions?: CardContent<TData> | CardContent<TData>[];
  /**
   * 본문 그리드 열 수. 기본 1.
   * 행은 선언 순서대로 채워지므로 배치는 `columns` + 필드별 `span` 으로만 표현한다.
   */
  columns?: MobileCardColumns;
  fields?: MobileCardField<TData>[];
  /**
   * 본문을 직접 그린다. 지정하면 `fields` 그리드 대신 이 노드가 렌더된다.
   *
   * label/value 격자로 표현되지 않는 카드(좌측 상태 바·강조 값·행 액션)에만 쓴다 —
   * 기본 표현은 어디까지나 `fields` 다. 카드 안쪽 여백은 셸이 주므로
   * 본문은 내용만 그리고, 버튼을 둔다면 클릭 전파 차단도 본문이 책임진다.
   */
  body?: CardContent<TData>;
}
