import { useCallback, useMemo, useState } from "react";

import type { SheetSectionId } from "../section-progress";
import { collectFieldPaths, readField, sectionOfPath } from "../required-fields";
import type { SheetFieldPath } from "../required-fields";
import type { SheetForm } from "../types";

/** 불러온 시점의 시트와 출처 — 어느 회차에서 왔는지 배너가 밝힌다 */
interface LoadedSource {
  snapshot: SheetForm;
  label: string;
}

/**
 * 이전 회차에서 불러온 값을 "아직 확인하지 않은 값"으로 추적한다.
 *
 * 불러오기는 활성 기록지를 통째로 갈아끼우고 토스트 한 줄만 남긴다. 어느 칸이 지난 회차 값인지
 * 화면에 표시가 없으면 "확인 후 저장하세요"라는 안내를 지킬 방법이 없다.
 *
 * **플래그를 칸마다 심지 않고 스냅샷 비교로 파생시킨다.** 값을 고치면 스냅샷과 달라져 저절로
 * 풀리므로, 입력 경로(patchWeather·patchPoint·…)마다 해제 코드를 끼워 넣지 않아도 된다.
 * 이 슬라이스의 입력 경로는 십수 개라 하나만 빠뜨려도 색이 남는다.
 *
 * **저장은 확인이 아니다.** 강조를 푸는 것은 사용자의 확인(값 수정·포커스·확인 버튼)뿐이며,
 * 저장 성공은 여기에 손대지 않는다 — 불러오기 직후 저장을 누르면 한 칸도 보지 않은 지난 회차
 * 값이 평범한 입력값과 구분되지 않게 되고, 그게 불러오기가 만든 위험 그 자체다.
 */
export const useBorrowedFields = (sheet: SheetForm | null) => {
  const [source, setSource] = useState<LoadedSource | null>(null);
  const [acknowledged, setAcknowledged] = useState<ReadonlySet<SheetFieldPath>>(new Set());

  /** 불러오기 성공 시 스냅샷을 건다 */
  const mark = useCallback((snapshot: SheetForm, label: string) => {
    setSource({ snapshot, label });
    setAcknowledged(new Set());
  }, []);

  const acknowledge = useCallback((path: SheetFieldPath) => {
    setAcknowledged((prev) => (prev.has(path) ? prev : new Set(prev).add(path)));
  }, []);

  /**
   * 아직 확인하지 않은 "불러온 값" 경로.
   *
   * 측정점·시료를 더하거나 지우면 경로의 인덱스가 통째로 밀려 엉뚱한 칸이 물든다.
   * 개수가 달라진 배열은 그 섹션 전체를 강조 대상에서 뺀다 — 상태를 따로 동기화하지 않고
   * 파생 단계에서 걸러 낸다.
   */
  const pending = useMemo<ReadonlySet<SheetFieldPath>>(() => {
    if (!sheet || !source) return new Set();
    // 기록지 탭을 옮기면 다른 시트다. 스냅샷은 불러온 그 기록지에만 유효하다.
    if (sheet.category !== source.snapshot.category) return new Set();

    const { snapshot } = source;
    const pointsShifted = sheet.samplingPoints.length !== snapshot.samplingPoints.length;
    const samplesShifted = sheet.samples.length !== snapshot.samples.length;

    return new Set(
      collectFieldPaths(snapshot).filter((path) => {
        if (acknowledged.has(path)) return false;
        if (pointsShifted && path.startsWith("points.")) return false;
        if (samplesShifted && path.startsWith("samples.")) return false;

        const loaded = readField(snapshot, path);
        return loaded.trim() !== "" && readField(sheet, path) === loaded;
      }),
    );
  }, [sheet, source, acknowledged]);

  const countBySection = useMemo(() => {
    const counts = new Map<SheetSectionId, number>();

    for (const path of pending) {
      const id = sectionOfPath(path);
      if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  }, [pending]);

  const acknowledgeAll = useCallback(() => {
    setAcknowledged((prev) => new Set([...prev, ...pending]));
  }, [pending]);

  /**
   * 한 섹션의 불러온 값을 한 번에 확인 처리한다 — 섹션 헤더의 `전체 확인`.
   * 범위 판정은 헤더 배지(`countBySection`)와 같은 `sectionOfPath` 를 쓴다 —
   * 두 곳이 다른 목록을 보면 "불러옴 3" 인데 눌러도 하나가 남는 화면이 나온다.
   */
  const acknowledgeSection = useCallback((id: SheetSectionId) => {
    setAcknowledged((prev) => {
      const next = new Set(prev);
      for (const path of pending) {
        if (sectionOfPath(path) === id) next.add(path);
      }
      return next;
    });
  }, [pending]);

  return {
    /** 불러오기 직후 호출한다 — 스냅샷과 출처 문구를 건다 */
    mark,
    /** 그 칸에 포커스가 들어왔다 = 눈으로 확인했다 */
    acknowledge,
    acknowledgeAll,
    acknowledgeSection,
    isBorrowed: useCallback((path: SheetFieldPath) => pending.has(path), [pending]),
    borrowedCountOf: useCallback(
      (id: SheetSectionId) => countBySection.get(id) ?? 0,
      [countBySection],
    ),
    borrowedCount: pending.size,
    /** 배너에 실을 출처 — `2026-05-12 | SN-1234` */
    sourceLabel: source?.label ?? "",
  };
};
