import type { Table } from '@tanstack/react-table';

import type { CardContent, MobileCardConfig, MobileCardField } from '@shared/model';

/**
 * `mobileCard` 를 선언하지 않은 테이블의 기본 카드 배치를 컬럼 순서에서 도출한다.
 *
 * 배치 규칙을 이 한 곳에 모아 명시화한다.
 * - 첫 접근자(accessor) 컬럼 → 제목
 * - display 컬럼(`accessorFn === undefined`) → 헤더 우측 액션
 * - 나머지 접근자 컬럼 → 본문 필드 (라벨은 문자열 header, 없으면 컬럼 id)
 *
 * 모든 조각을 컬럼 id 로 참조하므로 데스크탑 셀 렌더러가 카드에서도 그대로 살아난다.
 */
export const deriveCardConfig = <TData,>(table: Table<TData>): MobileCardConfig<TData> => {
  let title: CardContent<TData> | undefined;
  const actions: CardContent<TData>[] = [];
  const fields: MobileCardField<TData>[] = [];

  table.getVisibleLeafColumns().forEach((column) => {
    if (column.accessorFn === undefined) {
      actions.push(column.id);
      return;
    }

    if (title === undefined) {
      title = column.id;
      return;
    }

    const header = column.columnDef.header;
    fields.push({
      label: typeof header === 'string' ? header : column.id,
      content: column.id,
    });
  });

  return { title, actions, fields };
};
