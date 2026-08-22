/**
 * 배열의 한 항목을 다른 위치로 옮긴 새 배열을 만든다.
 *
 * 드래그앤드롭·위/아래 버튼이 공통으로 쓰는 순서 계산이다.
 * 원본은 건드리지 않고, 옮길 필요가 없거나 인덱스가 범위를 벗어나면 얕은 복사본을 그대로 돌려준다.
 */
export const moveItem = <T>(list: readonly T[], from: number, to: number): T[] => {
  const next = [...list];

  const isOutOfRange =
    from < 0 || from >= next.length || to < 0 || to >= next.length;

  if (isOutOfRange || from === to) return next;

  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  return next;
};
