import { Fragment, type ReactNode } from "react";

import { useGridNavigation } from "@shared/model";
import type { FieldTone } from "@shared/model";
import type { SelectOption } from "@shared/ui/form";
import { cn } from "@/lib/utils";

import { TableInputCell } from "./TableInputCell";
import { TableLabelCell } from "./TableLabelCell";
import { TableResultCell } from "./TableResultCell";
import { TableSelectCell } from "./TableSelectCell";

interface ColumnBase {
  /** 열 머리 */
  header: ReactNode;
  /**
   * 열 폭 (px). 합이 표의 `minWidth` 가 된다 — 표는 좁아지면 가로 스크롤한다.
   * `fit` 을 켜면 고정 폭이 아니라 열 간 비율로만 쓰인다.
   */
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
  /**
   * 정수부·소수부 최대 자릿수. 넘기면 **타이핑이 들어가지 않는다**.
   * `max` 와 갈래가 다르다 — `max` 는 표시용이고 범위 검증은 validator 몫이다.
   *
   * 열 단위 단일 값이다. 행마다 자릿수가 갈리는 표가 아직 없어서인데, 필요해지면
   * `tone`·`disabled` 처럼 `(row) => number` 로 넓힌다.
   */
  maxIntDigits?: number;
  maxDecimals?: number;
  /** 행별 비활성. 표 전체의 `editable` 과 합쳐진다 */
  disabled?: (row: T) => boolean;
  /** 셀별 상태 색. 의미는 호출부가 정한다 — 셀 단위로 갈리므로 행이 아니라 여기서 받는다 */
  tone?: (row: T, index: number) => FieldTone;
  /** 값이 들어차면 셀을 연초록으로 물들인다(기본 켜짐). 완료 개념이 없는 열에서는 끈다 */
  showComplete?: boolean;
  /** 그 셀에 포커스가 들어왔을 때 */
  onFocus?: (row: T, index: number) => void;
}

/**
 * 정해진 값 중 하나를 고르는 칸.
 *
 * 트리거가 버튼이라 `Alt+화살표` 이동에는 끼지 않는다 — 이동은 `Tab` 이 맡는다.
 */
interface SelectColumn<T> extends ColumnBase {
  kind: "select";
  options: SelectOption[];
  value: (row: T) => string;
  onChange: (row: T, value: string, index: number) => void;
  placeholder?: string;
  /** 행별 비활성. 표 전체의 `editable` 과 합쳐진다 */
  disabled?: (row: T) => boolean;
  /** 셀별 상태 색. 의미는 호출부가 정한다 */
  tone?: (row: T, index: number) => FieldTone;
  /** 값을 고르면 셀을 연초록으로 물들인다(기본 켜짐). 완료 개념이 없는 열에서는 끈다 */
  showComplete?: boolean;
  /** 그 셀에 포커스가 들어왔을 때 */
  onFocus?: (row: T, index: number) => void;
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
  | SelectColumn<T>
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
  /**
   * 표를 컨테이너 폭에 맞춰 가로 스크롤을 없앤다. 켜면 `width` 는 고정 폭이 아니라
   * **열 간 비율 힌트**로만 쓰인다 (`table-fixed` — 폭이 모자라면 비율대로 함께 줄어든다).
   *
   * 열이 적어 좁은 화면에도 다 들어가는 표에만 준다 (회차 3열 등). 열이 많은 표를 이걸로
   * 접으면 칸마다 두세 글자만 보여 못 읽는다 — 그런 표는 기본값(가로 스크롤)이 맞다.
   */
  fit?: boolean;
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
          maxIntDigits={column.maxIntDigits}
          maxDecimals={column.maxDecimals}
          value={column.value(row)}
          disabled={!editable || (column.disabled?.(row) ?? false)}
          tone={column.tone?.(row, index)}
          showComplete={column.showComplete}
          onFocus={column.onFocus && (() => column.onFocus?.(row, index))}
          onChange={(v) => column.onChange(row, v, index)}
        />
      );

    case "select":
      return (
        <TableSelectCell
          key={key}
          options={column.options}
          placeholder={column.placeholder}
          value={column.value(row)}
          disabled={!editable || (column.disabled?.(row) ?? false)}
          tone={column.tone?.(row, index)}
          showComplete={column.showComplete}
          onFocus={column.onFocus && (() => column.onFocus?.(row, index))}
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
 * 좁은 폭의 표현은 따로 그린다. 열이 적어 좁은 화면에도 표 그대로 세울 수 있으면 `fit` 을
 * 켠다 — 가로 스크롤 대신 열이 비율대로 줄어든다.
 *
 * 열이 데이터 개수만큼 늘어나는 전치 표(행=항목, 열=측정점)는 이 조립기의 모양이 아니다.
 * 그런 표는 셀 부품(`TableLabelCell`·`TableInputCell`·`TableResultCell`)을 직접 쓰고
 * `useGridNavigation` 만 따로 얹는다.
 */
export const InputTable = <T,>({
  rows, columns, getRowKey, editable = true, rowError, className, fit = false,
}: Props<T>) => {
  const gridNav = useGridNavigation();

  const visible = columns.filter((c) => c.kind !== "action" || editable);
  const minWidth = visible.reduce((acc, c) => acc + c.width, 0);

  return (
    <div {...gridNav} className={cn("overflow-x-auto rounded-button", className)}>
      <table
        className={cn("w-full border-collapse", fit && "table-fixed")}
        style={fit ? undefined : { minWidth: `${minWidth}px` }}
      >
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
    </div>
  );
};
