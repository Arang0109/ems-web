import { Button, Popover } from "ems-web";

/**
 * `open` 을 넘기면 열림 상태를 부모가 소유한다.
 * 팝업에 **기본 폭이 없으므로** 폭은 `className` 으로 호출부가 준다.
 */
export const Open = () => (
  <Popover
    open
    title="측정 조건"
    className="w-72"
    content={
      <div className="flex flex-col gap-2 text-body-3">
        <span>표준산소농도 6 %</span>
        <span>측정 유량 1,250 ㎥/min</span>
        <span>측정자 이서연</span>
      </div>
    }
  >
    <Button variant="outline" size="sm">
      측정 조건 보기
    </Button>
  </Popover>
);

/** 닫힌 상태 — 트리거만 보인다 */
export const Closed = () => (
  <Popover title="측정 조건" content="열면 조건이 보입니다." className="w-72">
    <Button variant="outline" size="sm">
      측정 조건 보기
    </Button>
  </Popover>
);
