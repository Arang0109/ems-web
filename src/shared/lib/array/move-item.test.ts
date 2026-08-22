import { describe, expect, it } from "vitest";

import { moveItem } from "./move-item";

describe("moveItem", () => {
  const list = ["a", "b", "c", "d"] as const;

  it("앞의 항목을 뒤로 옮긴다", () => {
    expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a", "d"]);
  });

  it("뒤의 항목을 앞으로 옮긴다", () => {
    expect(moveItem(list, 3, 0)).toEqual(["d", "a", "b", "c"]);
  });

  it("한 칸 위로 옮긴다 (위 버튼)", () => {
    expect(moveItem(list, 2, 1)).toEqual(["a", "c", "b", "d"]);
  });

  it("한 칸 아래로 옮긴다 (아래 버튼)", () => {
    expect(moveItem(list, 1, 2)).toEqual(["a", "c", "b", "d"]);
  });

  it("제자리로 옮기면 순서가 그대로다", () => {
    expect(moveItem(list, 1, 1)).toEqual(["a", "b", "c", "d"]);
  });

  it("원본을 변경하지 않는다", () => {
    const original = ["a", "b", "c"];
    moveItem(original, 0, 2);
    expect(original).toEqual(["a", "b", "c"]);
  });

  it("새 배열을 돌려준다", () => {
    const original = ["a", "b", "c"];
    expect(moveItem(original, 0, 0)).not.toBe(original);
  });

  it("범위를 벗어난 인덱스는 순서를 바꾸지 않는다", () => {
    // 첫 항목의 위 버튼·마지막 항목의 아래 버튼은 비활성이지만, 방어적으로 확인한다
    expect(moveItem(list, 0, -1)).toEqual(["a", "b", "c", "d"]);
    expect(moveItem(list, 3, 4)).toEqual(["a", "b", "c", "d"]);
    expect(moveItem(list, -1, 0)).toEqual(["a", "b", "c", "d"]);
    expect(moveItem(list, 4, 0)).toEqual(["a", "b", "c", "d"]);
  });

  it("빈 배열은 그대로 둔다", () => {
    expect(moveItem([], 0, 0)).toEqual([]);
  });

  it("객체 배열도 참조를 유지한 채 순서만 바꾼다", () => {
    const first = { id: 1 };
    const second = { id: 2 };
    const moved = moveItem([first, second], 0, 1);

    expect(moved).toEqual([second, first]);
    expect(moved[0]).toBe(second);
  });
});
