import React from "react";

/**
 * 이동 대상이 되는 입력 칸.
 *
 * 비활성·읽기전용 칸은 건너뛴다 — 표가 읽기 모드면 이동할 곳이 아예 없어 훅이 조용해진다.
 * 버튼(삭제 등)은 포함하지 않는다. 엔터로 눌러야 하는 요소라 이동 키와 뜻이 겹친다.
 */
const FOCUSABLE = "input:not([disabled]):not([readonly])";

interface GridNavigation {
  /** 표를 감싸는 요소에 그대로 펼친다 */
  onKeyDown: React.KeyboardEventHandler<HTMLElement>;
}

/**
 * `colSpan` 을 더해 얻은 셀의 시작 열 위치.
 *
 * `cellIndex` 를 그대로 쓰면 병합 셀이 있는 행에서 열이 어긋난다 —
 * 에러 행·그룹 머리처럼 한 칸으로 펼친 행이 표 중간에 끼기 때문이다.
 */
const columnOf = (cell: HTMLTableCellElement): number => {
  const row = cell.closest("tr");
  if (!row) return cell.cellIndex;

  let column = 0;
  for (const candidate of Array.from(row.cells)) {
    if (candidate === cell) return column;
    column += candidate.colSpan;
  }
  return column;
};

/** 그 행에서 `column` 위치를 덮는 셀. 병합 셀이면 자기 범위 안의 열을 전부 받는다 */
const cellAtColumn = (row: HTMLTableRowElement, column: number): HTMLTableCellElement | null => {
  let start = 0;
  for (const cell of Array.from(row.cells)) {
    if (column < start + cell.colSpan) return cell;
    start += cell.colSpan;
  }
  return null;
};

/** 같은 열에서 위/아래로 가장 가까운 입력 칸. 입력이 없는 행(에러·그룹 머리)은 그냥 지나친다 */
const verticalTarget = (from: HTMLTableCellElement, delta: 1 | -1): HTMLInputElement | null => {
  const row = from.closest("tr");
  const table = from.closest("table");
  if (!row || !table) return null;

  const column = columnOf(from);
  const rows = Array.from(table.rows);

  for (let i = row.rowIndex + delta; i >= 0 && i < rows.length; i += delta) {
    const cell = cellAtColumn(rows[i], column);
    const input = cell?.querySelector<HTMLInputElement>(FOCUSABLE);
    if (input) return input;
  }
  return null;
};

/**
 * 같은 행에서 좌/우로 가장 가까운 입력 칸.
 *
 * 행 끝에서 다음 행으로 넘어가지 않는다 — 줄바꿈 이동은 `Tab` 이 이미 맡고 있고,
 * 여기서까지 감아 돌면 "왼쪽 화살표를 눌렀는데 윗줄로 갔다" 가 된다.
 */
const horizontalTarget = (from: HTMLTableCellElement, delta: 1 | -1): HTMLInputElement | null => {
  const row = from.closest("tr");
  if (!row) return null;

  const cells = Array.from(row.cells);
  for (let i = cells.indexOf(from) + delta; i >= 0 && i < cells.length; i += delta) {
    const input = cells[i].querySelector<HTMLInputElement>(FOCUSABLE);
    if (input) return input;
  }
  return null;
};

/** 표 전체의 첫/마지막 입력 칸 */
const edgeTarget = (input: HTMLInputElement, side: "first" | "last"): HTMLInputElement | null => {
  const table = input.closest("table");
  if (!table) return null;

  const inputs = Array.from(table.querySelectorAll<HTMLInputElement>(FOCUSABLE));
  return (side === "first" ? inputs[0] : inputs[inputs.length - 1]) ?? null;
};

/**
 * 입력 표의 셀 간 키보드 이동.
 *
 * 표를 감싸는 요소에 `onKeyDown` 하나만 얹으면 되고, 입력 컴포넌트에는 손대지 않는다 —
 * 좌표를 `tr.rowIndex`·`td.cellIndex` 라는 네이티브 속성에서 읽기 때문에 셀에 별도의
 * 표식(`data-*`)을 달거나 입력마다 `ref` 를 배선할 필요가 없다.
 *
 * | 키 | 동작 |
 * |----|------|
 * | `Alt+↑↓←→` | **상하좌우 칸** — 이 표의 기본 이동 |
 * | `Enter` / `Shift+Enter` | 아래/위 행의 같은 열 (연속 입력용) |
 * | `Tab` / `Shift+Tab` | 네이티브 그대로 — 행 끝에서 다음 행으로 감아 돈다 |
 * | `Ctrl+Home` / `Ctrl+End` | 표의 첫/마지막 칸 |
 *
 * **맨 화살표는 건드리지 않는다.** 입력 칸은 늘 편집 중이라 화살표가 이미 임자가 있다 —
 * 좌우는 캐럿 이동이고, 상하는 `NumericField`·`TimeField` 의 값 증감이다. 여기에
 * "칸이 비었을 때만", "캐럿이 끝에 닿았을 때만" 같은 조건부 이동을 얹으면 같은 키가
 * 상황따라 다르게 움직여 오히려 못 쓴다. 그래서 이동은 `Alt` 로 명확히 갈라 놓았다.
 *
 * 조합키가 얹힌 ↑/↓ 는 `useNumericInput`·`TimeField` 가 증감으로 삼지 않고 흘려보내므로
 * `Alt+↑/↓` 는 숫자·시각 칸에서도 그대로 이동이다. 그 외에 필드가 이미 소비한 키는
 * `preventDefault` 로 표시되므로, 아래 핸들러는 `defaultPrevented` 를 먼저 확인해 양보한다.
 */
export const useGridNavigation = (): GridNavigation => {
  const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    // 입력 컴포넌트가 이미 소비한 키 (NumericField·TimeField 의 ↑/↓ 증감)
    if (e.defaultPrevented) return;

    const input = e.target;
    if (!(input instanceof HTMLInputElement) || !input.matches(FOCUSABLE)) return;

    const cell = input.closest("td, th");
    if (!(cell instanceof HTMLTableCellElement)) return;

    const move = (target: HTMLInputElement | null) => {
      if (!target) return;

      e.preventDefault();
      target.focus();
      // 옮겨간 칸은 통째로 덮어쓰는 편이 많다 — 전체 선택해 바로 타이핑되게 한다
      target.select();
    };

    if (e.ctrlKey || e.metaKey) {
      if (e.key === "Home") move(edgeTarget(input, "first"));
      if (e.key === "End") move(edgeTarget(input, "last"));
      return;
    }

    if (e.key === "Enter") {
      move(verticalTarget(cell, e.shiftKey ? -1 : 1));
      return;
    }

    if (!e.altKey) return;

    const target =
      e.key === "ArrowUp" ? verticalTarget(cell, -1)
      : e.key === "ArrowDown" ? verticalTarget(cell, 1)
      : e.key === "ArrowLeft" ? horizontalTarget(cell, -1)
      : e.key === "ArrowRight" ? horizontalTarget(cell, 1)
      : undefined;

    // 화살표가 아닌 Alt 조합(브라우저·OS 단축키)은 건드리지 않는다
    if (target === undefined) return;

    // 표 끝이라 갈 곳이 없어도 기본 동작은 막는다 —
    // `Alt+←/→` 는 브라우저의 뒤로/앞으로 가기라 그냥 두면 입력 중이던 폼을 떠난다
    e.preventDefault();
    move(target);
  };

  return { onKeyDown };
};
