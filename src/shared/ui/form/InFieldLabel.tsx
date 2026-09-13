import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  htmlFor?: string;
  /** 라벨 문구 — 자리가 모자라면 이것만 줄인다 */
  children: React.ReactNode;
  required?: boolean;
  /** 라벨 뒤 괄호 단위 — `대기압 (hPa)`. 우측 단위 박스는 입력 폭을 갉아먹어 쓰지 않는다 */
  unit?: React.ReactNode;
  /** 라벨 오른쪽에 붙는 클릭 요소(도움말 아이콘 등) — 이 슬롯만 클릭을 받는다 */
  addon?: React.ReactNode;

  invalid?: boolean;
  disabled?: boolean;
  /** 글줄 시작점(`left-*`) — 호스트의 입력 좌패딩에 맞춘다 */
  className?: string;
}

/**
 * 인필드 라벨 — 라벨을 칸 **안 상단 좌측**에 얹는다. `InputGroup`·`UnitField` 가 공유한다.
 *
 * 칸 자체는 커지지만(38 → 48px) 바깥 라벨 줄이 사라져 한 필드가 먹는 세로 공간은 줄어든다.
 * 폼이 길수록 이 차이가 크다.
 *
 * 라벨 줄은 클릭을 흘려보낸다 — 칸 위에 얹혀 있어 입력창 포커스를 가로채면 안 된다.
 * `addon` 만 `pointer-events-auto` 로 되살린다.
 */
export const InFieldLabel = ({
  htmlFor,
  children,
  required = false,
  unit,
  addon,
  invalid = false,
  disabled = false,
  className,
}: Props) => (
  <div
    className={cn(
      "pointer-events-none absolute top-1.5 z-10 flex items-center gap-1",
      "max-w-[calc(100%-1.25rem)]",
      className,
    )}
  >
    <label
      htmlFor={htmlFor}
      data-slot="field-label"
      className={cn(
        "flex min-w-0 items-center gap-0.5 text-caption font-normal",
        invalid ? "text-danger" : "text-muted-ink",
        disabled && "opacity-50",
      )}
    >
      {/* 잘리면 뜻이 사라지는 것들(필수 표시·단위)은 줄이지 않는다 */}
      <span className="truncate">{children}</span>
      {required && <span className="shrink-0 text-danger">*</span>}
      {unit && <span className="shrink-0">({unit})</span>}
    </label>
    {addon && <span className="pointer-events-auto flex shrink-0 items-center">{addon}</span>}
  </div>
);
