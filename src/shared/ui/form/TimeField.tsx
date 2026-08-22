import React from "react";
import { Clock3 } from "lucide-react";

import { fromMinutes, maskTimeInput, normalizeTime, toMinutes } from "@shared/lib";
import { Button } from "@shared/ui/buttons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  id?: string;
  /** 확정값 `"HH:mm"` (미입력은 `""`). 타이핑 중인 미완성 값은 내부에만 있다 */
  value: string;
  onChange: (value: string) => void;

  /** 테두리를 직접 그릴지 — 호스트(`UnitField`·표 셀)가 프레임을 소유하면 `"none"` */
  frame?: "bordered" | "none";
  /** 어떤 항목의 시각인지 — 입력창과 시계 버튼의 접근성 이름이 된다 */
  label?: string;
  placeholder?: string;
  disabled?: boolean;

  /** 루트(프레임) 클래스 — 폭 지정 등 */
  className?: string;
  /** 입력창 클래스 — 호스트의 타이포·패딩을 맞출 때 */
  inputClassName?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

/** 분 목록의 간격 — 현장 기록은 분 단위가 그대로 의미를 가지므로 60 개를 모두 노출한다 */
const MINUTE_STEP = 1;
const MINUTES = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP);

/** ↑/↓ 증감 폭. Shift 를 누르면 1 분 단위로 미세 조정한다 */
const ARROW_STEP = 5;
const ARROW_FINE_STEP = 1;

const pad2 = (n: number): string => String(n).padStart(2, "0");

const nowTime = (): string => {
  const now = new Date();
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
};

/** 목록 안에서만 스크롤한다 — `scrollIntoView` 는 팝오버 바깥 페이지까지 끌고 간다 */
const scrollToSelected = (el: HTMLButtonElement | null): void => {
  const list = el?.parentElement;
  if (!el || !list) return;

  list.scrollTop = el.offsetTop - list.clientHeight / 2 + el.clientHeight / 2;
};

/**
 * 시각 입력 — 숫자 타이핑이 주(主), 시·분 목록이 보조다.
 *
 * `<input type="time">` 은 브라우저마다 위젯이 달라(스피너·AM/PM·시계 아이콘)
 * 폭과 높이가 디자인 스펙에서 어긋나고, 현장에서 쓰는 24시간 4자리 입력과도 맞지 않는다.
 * 그래서 텍스트 입력 위에 마스킹(`maskTimeInput`)과 보정(`normalizeTime`)을 얹었다.
 *
 * - `"1430"` 처럼 숫자만 치면 콜론이 끼워진다. 포커스를 벗어나면 미완성 값이 확정된다
 * - ↑/↓ 5 분, Shift+↑/↓ 1 분 증감. 비어 있으면 현재 시각에서 시작한다
 * - 시계 아이콘 → 시·분 목록 팝오버. 분은 1 분 단위(00~59)로 모두 나온다
 */
export const TimeField = ({
  id,
  value,
  onChange,
  frame = "bordered",
  label,
  placeholder = "--:--",
  disabled = false,
  className,
  inputClassName,
}: Props) => {
  const [open, setOpen] = React.useState(false);

  // 타이핑 중인 표시값. 확정 전(`"14:"`)에는 value 와 어긋나 있으므로 별도로 든다.
  const [text, setText] = React.useState(value);
  // 마지막으로 폼에 올린 값 — value 가 "바깥에서" 바뀐 것인지 판별하는 기준이다.
  const [committed, setCommitted] = React.useState(value);

  // 바깥에서 값이 갈아끼워지면(시트 전환·자동계산) 타이핑 중이던 표시값을 버린다.
  // 렌더 중 조정이라 effect 처럼 화면이 한 번 더 그려지지 않는다.
  if (value !== committed) {
    setCommitted(value);
    setText(value);
  }

  const commit = (next: string) => {
    setText(next);
    if (next === committed) return;

    setCommitted(next);
    onChange(next);
  };

  const handleInput = (raw: string) => {
    const isDeleting = raw.length < text.length;
    const masked = maskTimeInput(raw);

    // 백스페이스가 콜론만 지웠다면 마스크가 곧바로 되살려 삭제가 먹히지 않는다.
    // 콜론은 자리표일 뿐이므로 앞의 숫자 한 자리를 함께 지운다.
    const next = isDeleting && masked === text ? maskTimeInput(raw.slice(0, -1)) : masked;

    // 확정 형태(`"HH:mm"`)와 빈 값만 폼에 반영한다. 미완성 값은 blur 때 확정된다.
    if (next.length === 5 || next === "") commit(next);
    else setText(next);
  };

  const shift = (delta: number) => {
    const base = toMinutes(normalizeTime(text));
    // 빈 칸에서 누르면 현재 시각을 시작점으로 준다 — 0 시부터 돌리게 하지 않는다.
    commit(base === null ? nowTime() : fromMinutes(base + delta));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    // 조합키가 얹힌 ↑/↓ 는 증감이 아니다 — 입력 표의 셀 이동(`useGridNavigation`)에 넘긴다.
    // Shift 는 예외 — 미세 증감(1분)이 이 필드의 동작이다
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    e.preventDefault();
    const step = e.shiftKey ? ARROW_FINE_STEP : ARROW_STEP;
    shift(e.key === "ArrowUp" ? step : -step);
  };

  const selected = toMinutes(normalizeTime(text));
  const selectedHour = selected === null ? null : Math.floor(selected / 60);
  const selectedMinute = selected === null ? null : selected % 60;

  // MINUTE_STEP 을 넓히면 그 배수가 아닌 분(09:37 등)도 목록에서 선택 상태로 보이게 끼운다.
  const minuteOptions =
    selectedMinute === null || selectedMinute % MINUTE_STEP === 0
      ? MINUTES
      : [...MINUTES, selectedMinute].sort((a, b) => a - b);

  const pick = (hour: number, minute: number) => commit(fromMinutes(hour * 60 + minute));

  const hourRef = React.useRef<HTMLButtonElement>(null);
  const minuteRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;

    // 열 때만 현재 값 위치로 맞춘다 — 열려 있는 동안의 선택은 스크롤을 건드리지 않는다.
    scrollToSelected(hourRef.current);
    scrollToSelected(minuteRef.current);
  }, [open]);

  const columnClass = "max-h-52 w-16 overflow-y-auto py-1";
  const optionClass = (isSelected: boolean) =>
    cn(
      "flex h-10 w-full items-center justify-center rounded-button text-body-2 transition-colors md:h-8",
      "hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
      isSelected ? "bg-brand-primary text-surface hover:bg-brand-dark" : "text-ink",
    );

  return (
    <div
      className={cn(
        "flex min-w-0 items-stretch",
        frame === "bordered"
          ? [
              "h-12 overflow-hidden rounded-button border border-rule-dark bg-surface md:h-9.5",
              !disabled &&
                "focus-within:border-brand-primary focus-within:ring-3 focus-within:ring-brand-primary/12",
              disabled && "bg-rule/40",
            ]
          : "flex-1",
        className,
      )}
    >
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={5}
        // 호스트가 id 로 <label> 을 걸었다면 그쪽이 이름을 소유한다 (UnitField)
        aria-label={id ? undefined : label}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => handleInput(e.target.value)}
        onBlur={() => commit(normalizeTime(text))}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full min-w-0 bg-transparent px-3 text-ink outline-none",
          "tabular-nums placeholder:text-muted-ink",
          "disabled:cursor-not-allowed disabled:text-muted-ink",
          inputClassName,
        )}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              disabled={disabled}
              aria-label={label ? `${label} 목록에서 선택` : "시각 목록에서 선택"}
              className={cn(
                "flex w-10 shrink-0 items-center justify-center text-muted-ink transition-colors md:w-9",
                "hover:text-brand-dark focus-visible:outline-none focus-visible:text-brand-dark",
                "disabled:cursor-not-allowed disabled:text-muted-ink/60",
              )}
            >
              <Clock3 size={16} aria-hidden />
            </button>
          }
        />

        <PopoverContent className="w-auto gap-0 p-2" align="end">
          <div className="flex gap-1">
            <div className={columnClass} role="listbox" aria-label="시">
              {HOURS.map((hour) => (
                <button
                  key={hour}
                  ref={hour === selectedHour ? hourRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={hour === selectedHour}
                  onClick={() => pick(hour, selectedMinute ?? 0)}
                  className={optionClass(hour === selectedHour)}
                >
                  {pad2(hour)}
                </button>
              ))}
            </div>

            <div className={columnClass} role="listbox" aria-label="분">
              {minuteOptions.map((minute) => (
                <button
                  key={minute}
                  ref={minute === selectedMinute ? minuteRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={minute === selectedMinute}
                  onClick={() => pick(selectedHour ?? Number(nowTime().slice(0, 2)), minute)}
                  className={optionClass(minute === selectedMinute)}
                >
                  {pad2(minute)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex gap-1 border-t border-rule pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => commit(nowTime())}>
              지금
            </Button>
            <Button size="sm" className="flex-1" onClick={() => setOpen(false)}>
              완료
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
