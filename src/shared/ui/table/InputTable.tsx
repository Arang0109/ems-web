import { Fragment, type ReactNode } from "react";

import { useGridNavigation } from "@shared/model";
import { cn } from "@/lib/utils";

import { TableInputCell } from "./TableInputCell";
import { TableLabelCell } from "./TableLabelCell";
import { TableResultCell } from "./TableResultCell";

interface ColumnBase {
  /** 열 머리 */
  header: ReactNode;
  /** 열 폭 (px). 합이 표의 `minWidth` 가 된다 — 표는 좁아지면 가로 스크롤한다 */
  width: number;
  /** 머리 옆 도움말 — 용어 설명·계산식 */
  hint?: ReactNode;
  /** 도움말 아이콘의 접근성 이름 (`header` 가 문자열이 아닐 때 지정) */
  hintLabel?: string;
}

/** 행을 식별하는 열 — `th scope="row"` 로 그려 스크린리더가 행 이름으로 읽는다 */
interface LabelColumn<T> extends ColumnBase {
  kind: "label";
  render: (row: T, index: number) => ReactNode;
  /** 이름이 길어 왼쪽으로 흘려야 할 때 */
  align?: "center" | "left";
}

/** 고칠 수 없는 원장 값 — 참고용으로 나란히 두는 열 */
interface ReadonlyColumn<T> extends ColumnBase {
  kind: "readonly";
  render: (row: T, index: number) => ReactNode;
}

/** 입력 칸 */
interface InputColumn<T> extends ColumnBase {
  kind: "input";
  value: (row: T) => string;
  onChange: (row: T, value: string, index: number) => void;
  /** `number` 는 `NumericField`, `time` 은 `TimeField` 로 렌더된다 */
  type?: "text" | "number" | "time";
  unit?: ReactNode;
  placeholder?: string;
  /** 음수가 성립하지 않는 항목에는 `0` 을 준다 — `NumericField` 의 ± 버튼이 빠진다 */
  min?: number;
  max?: number;
  step?: number;
  /** 행별 비활성. 표 전체의 `editable` 과 합쳐진다 */
  disabled?: (row: T) => boolean;
}

/** 자동계산 결과 — 회색 배경으로 입력 칸과 구분된다 */
interface ResultColumn<T> extends ColumnBase {
  kind: "result";
  value: (row: T, index: number) => string | number;
  unit?: ReactNode;
}

/** 행 액션(삭제 등). `editable` 이 꺼지면 열째로 빠진다 */
interface ActionColumn<T> extends ColumnBase {
  kind: "action";
  render: (row: T, index: number) => ReactNode;
}

export type InputTableColumn<T> =
  | LabelColumn<T>
  | ReadonlyColumn<T>
  | InputColumn<T>
  | ResultColumn<T>
  | ActionColumn<T>;

interface Props<T> {
  rows: T[];
  columns: InputTableColumn<T>[];
  getRowKey: (row: T, index: number) => string | number;
  /** 꺼지면 입력이 전부 비활성되고 `action` 열이 사라진다 */
  editable?: boolean;
  /** 행 아래 한 줄로 붙는 에러. 어떤 행인지까지 포함한 완성된 문구를 돌려준다 */
  rowError?: (row: T, index: number) => string | undefined;
  /** 바깥 래퍼 클래스 — 표현을 폭으로 가르는 호출부의 `hidden md:block` 자리 */
  className?: string;
}

const READONLY_CLASS =
  "border border-rule p-2 text-center text-body-3 text-ink-soft whitespace-nowrap";

const renderCell = <T,>(
  column: InputTableColumn<T>,
  row: T,
  index: number,
  key: number,
  editable: boolean,
): ReactNode => {
  switch (column.kind) {
    case "label":
      return (
        <TableLabelCell key={key} align={column.align}>
          {column.render(row, index)}
        </TableLabelCell>
      );

    case "readonly":
      return <td key={key} className={READONLY_CLASS}>{column.render(row, index)}</td>;

    case "result":
      return <TableResultCell key={key} value={column.value(row, index)} unit={column.unit} />;

    case "input":
      return (
        <TableInputCell
          key={key}
          type={column.type}
          unit={column.unit}
          placeholder={column.placeholder}
          min={column.min}
          max={column.max}
          step={column.step}
          value={column.value(row)}
          disabled={!editable || (column.disabled?.(row) ?? false)}
          onChange={(v) => column.onChange(row, v, index)}
        />
      );

    case "action":
      return <td key={key} className="border border-rule text-center">{column.render(row, index)}</td>;
  }
};

/**
 * 행=레코드, 열=항목인 입력 표.
 *
 * 셀 안에서 바로 편집하는 기록지형 표의 조립기다. 열 선언 배열 하나로 머리·폭·입력 스펙이
 * 모두 정해지므로, 호출부는 표 마크업 대신 "이 레코드의 어떤 값을 어떻게 받는가"만 쓴다.
 *
 * **셀 간 키보드 이동이 기본으로 붙는다** (`useGridNavigation`) — 엔터로 아래 행,
 * `Alt+화살표` 로 상하좌우. ↑/↓ 는 숫자·시각 필드의 값 증감이 계속 가져간다.
 *
 * 모바일 표현은 일부러 맡지 않는다. 칸이 적으면 카드에 펼치고 많으면 모달에서 고치는 식으로
 * 화면마다 답이 다르므로, 호출부가 `hidden md:block` 으로 이 표를 데스크탑에만 세우고
 * 좁은 폭의 표현은 따로 그린다.
 *
 * 열이 데이터 개수만큼 늘어나는 전치 표(행=항목, 열=측정점)는 이 조립기의 모양이 아니다.
 * 그런 표는 셀 부품(`TableLabelCell`·`TableInputCell`·`TableResultCell`)을 직접 쓰고
 * `useGridNavigation` 만 따로 얹는다.
 */
export const InputTable = <T,>({
  rows, columns, getRowKey, editable = true, rowError, className,
}: Props<T>) => {
  const gridNav = useGridNavigation();

  const visible = columns.filter((c) => c.kind !== "action" || editable);
  const minWidth = visible.reduce((acc, c) => acc + c.width, 0);

  return (
    <div {...gridNav} className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse" style={{ minWidth: `${minWidth}px` }}>
        <thead>
          <tr>
            {visible.map((column, i) => (
              <TableLabelCell
                key={i}
                scope="col"
                width={column.width}
                hint={column.hint}
                hintLabel={column.hintLabel}
              >
                {column.header}
              </TableLabelCell>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => {
            const error = rowError?.(row, index);

            return (
              <Fragment key={getRowKey(row, index)}>
                <tr>
                  {visible.map((column, i) => renderCell(column, row, index, i, editable))}
                </tr>

                {error && (
                  <tr>
                    <td
                      colSpan={visible.length}
                      className="border border-rule px-2 py-1 text-caption text-danger"
                    >
                      {error}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      <p className="text-caption text-danger">셀은 <b>Alt + 방향키</b>로 조작이 가능합니다.</p>
    </div>
  );
};
