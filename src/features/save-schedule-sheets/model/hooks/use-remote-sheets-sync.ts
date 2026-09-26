import { useCallback, useEffect, useRef, useState } from "react";

import type { ScheduleDetail, SheetRef, SheetsSavedEvent } from "@entities/schedule";
import { subscribeScheduleStream } from "@entities/schedule";
import { MEASUREMENT_CATEGORY_LABEL } from "@shared/config";
import { toast } from "@shared/ui/toasts";

import type { SheetForm } from "../types";
import type { GasSampleGroup } from "../gaseous/gaseous-rows";
import type { SheetBaseline } from "../sync/conflict";
import type { RemoteSyncResult, UpdatedSections } from "../sync/remote-sync";
import { applyRemoteSheets } from "../sync/remote-sync";

/** 갱신 강조를 유지하는 시간(ms). 눈에 들어올 만큼은 남기되 화면에 계속 붙어 있지는 않게. */
const UPDATED_HIGHLIGHT_MS = 8_000;

interface Params {
  scheduleId: number | null;
  /** 내 저장이 알림으로 되돌아온 메아리를 걸러내는 데 쓴다 */
  currentUsername: string | null;
  fetchSchedule: (scheduleId: number) => Promise<ScheduleDetail | null>;
  /** 병합 입력 — 최신 폼 상태. 수신 콜백은 커밋 이후 비동기로 돌므로 ref 로 읽는다 */
  sheets: SheetForm[];
  baseline: SheetBaseline;
  deletedSheets: SheetRef[];
  groups: GasSampleGroup[];
  /** 병합 결과를 폼 상태에 반영한다 — 상태는 파사드가 소유하므로 여기서 set 하지 않는다 */
  onApplied: (result: RemoteSyncResult) => void;
}

/**
 * 같은 측정계획을 열어둔 다른 사용자의 저장을 구독해 내 화면에 병합한다.
 *
 * 병합 규칙은 {@link applyRemoteSheets} 에 있다 — 내가 편집 중인 블록만 지키고 나머지는 서버 값을 따르며,
 * 시트 version 도 함께 이어받는다. 알림에 시트 본문을 싣지 않고 여기서 다시 조회하는 이유는, 조회 결과가
 * 늘 진실의 원천이기 때문이다 — 알림이 유실되거나 순서가 뒤바뀌어도 화면은 서버 상태로 수렴한다.
 *
 * 이 훅이 이 기능의 effect 를 전부 갖는다(ref 동기화·스트림 구독·강조 타이머). 나머지 파생값은 effect 없이
 * useMemo 로만 만든다는 규약을 지키기 위해서다.
 */
export const useRemoteSheetsSync = ({
  scheduleId, currentUsername, fetchSchedule, sheets, baseline, deletedSheets, groups, onApplied,
}: Params) => {
  // 다른 사용자의 저장으로 방금 갱신된 섹션 — 화면에서 어디가 바뀌었는지 짚어준다.
  const [updatedSections, setUpdatedSections] = useState<UpdatedSections>({});

  // 실시간 수신 콜백에서 최신 폼 상태를 읽기 위한 참조. 이 값들을 구독 의존성에 넣으면
  // 글자를 칠 때마다 스트림이 끊겼다 다시 붙는다.
  const sheetsRef = useRef(sheets);
  const baselineRef = useRef(baseline);
  const deletedRef = useRef(deletedSheets);
  const groupsRef = useRef(groups);
  const onAppliedRef = useRef(onApplied);
  // 동기화 세대 — 응답이 순서를 지키지 않아도 마지막 것만 반영하기 위한 표식.
  const syncSeqRef = useRef(0);

  // 렌더 중에 ref 를 건드리지 않는다. 수신 콜백은 커밋 이후 비동기로 도는 경로라 여기서 맞춰도 늦지 않다.
  useEffect(() => {
    sheetsRef.current = sheets;
    baselineRef.current = baseline;
    deletedRef.current = deletedSheets;
    groupsRef.current = groups;
    onAppliedRef.current = onApplied;
  });

  const applyRemoteSave = useCallback(async (event: SheetsSavedEvent) => {
    if (scheduleId == null) return;
    // 내 저장이 돌아온 메아리다. 이미 최신 상태이므로 재조회할 필요가 없다.
    if (event.editor.username === currentUsername) return;

    // 저장이 연달아 오면 응답이 뒤바뀔 수 있다. 뒤늦게 도착한 옛 조회로 화면을 되돌리면
    // 그 낡은 version 으로 저장하게 되어 애먼 409 가 난다. 마지막 동기화만 반영한다.
    const seq = syncSeqRef.current + 1;
    syncSeqRef.current = seq;

    const latest = await fetchSchedule(scheduleId);
    if (!latest || seq !== syncSeqRef.current) return;

    const result = applyRemoteSheets(
      sheetsRef.current, baselineRef.current, deletedRef.current, latest.snapshot.samplingData?.sheets ?? [],
      groupsRef.current,
    );

    if (result.changed) {
      onAppliedRef.current(result);
      setUpdatedSections(result.updatedSections);
    }

    // 이번 저장이 건드린 기록지에 한해 알린다 — 예전에 생긴 충돌을 매 저장마다 다시 알리지 않도록.
    const conflicted = result.conflictingCategories.filter((c) => event.categories.includes(c));
    if (conflicted.length > 0) {
      const labels = conflicted.map((category) => MEASUREMENT_CATEGORY_LABEL[category]).join("·");
      toast.warning(
        `${event.editor.name}님이 ${labels} 기록지의 같은 항목을 수정했습니다. `
        + "저장할 때 어느 값을 남길지 확인하게 됩니다.",
      );
      return;
    }

    // 눈에 보이는 변화가 없으면(version 만 이어받은 경우) 굳이 알리지 않는다.
    if (result.touchedCategories.length === 0) return;

    const labels = result.touchedCategories
      .map((category) => MEASUREMENT_CATEGORY_LABEL[category]).join("·");
    toast.info(`${event.editor.name}님이 ${labels} 기록지를 저장했습니다. 최신 내용으로 맞췄습니다.`);
  }, [scheduleId, currentUsername, fetchSchedule]);

  // 같은 측정계획을 열어둔 다른 사용자의 저장을 구독한다.
  useEffect(() => {
    if (scheduleId == null) return;
    return subscribeScheduleStream(scheduleId, {
      onSheetsSaved: (event) => { void applyRemoteSave(event); },
    });
  }, [scheduleId, applyRemoteSave]);

  // 강조는 잠깐만 남긴다. 갱신이 연달아 오면 마지막 것 기준으로 타이머가 다시 시작된다.
  useEffect(() => {
    if (Object.keys(updatedSections).length === 0) return;

    const timer = setTimeout(() => setUpdatedSections({}), UPDATED_HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [updatedSections]);

  // 내 저장으로 화면이 최신이 됐을 때 "다른 사용자가 갱신함" 강조를 걷는다.
  const clearUpdatedSections = useCallback(() => setUpdatedSections({}), []);

  return { updatedSections, clearUpdatedSections };
};
