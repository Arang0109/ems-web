import type { ScheduleDetail, SheetRef } from "@entities/schedule";
import type { MeasurementCategory } from "@shared/model";
import { MEASUREMENT_CATEGORY_LABEL } from "@shared/config";
import type { useConfirm } from "@shared/ui/dialogs";
import { toast } from "@shared/ui/toasts";

import type { SheetForm } from "../types";
import type { GasSampleGroup } from "../gaseous/gaseous-rows";
import { hydrateSheets } from "../gaseous/gaseous-rows";
import {
  describeSheetDiff, diffSheetVersions, getResolvableCategories, resolveWithServer,
} from "../sync/conflict";

interface Params {
  scheduleId: number | null;
  fetchSchedule: (scheduleId: number) => Promise<ScheduleDetail | null>;
  confirm: ReturnType<typeof useConfirm>;
}

/** 복구 시점의 폼 상태 — 무엇이 어긋났는지는 이것과 서버 최신본을 대조해 가린다 */
export interface ConflictContext {
  sheets: SheetForm[];
  deletedSheets: SheetRef[];
  /** 내가 실제로 바꾼 기록지의 카테고리 */
  changedCategories: MeasurementCategory[];
  groups: GasSampleGroup[];
}

/** 사용자가 되돌리기로 한 결과. 폼 상태에 반영하는 것은 호출부(상태 소유자)의 몫이다 */
export interface ConflictRecovery {
  sheets: SheetForm[];
  /** 서버 값으로 되돌린 기록지 — 기준선을 옮기고 삭제 요청을 취소할 대상 */
  categories: MeasurementCategory[];
}

/**
 * 저장이 409로 거부됐을 때의 복구 경로. 서버 최신본을 받아 무엇이 어긋났는지 가려내고,
 * 어긋난 기록지만 최신 내용으로 되돌릴지 사용자에게 묻는다.
 *
 * 되돌리면 그 기록지에 입력한 내 값은 사라지지만 **나머지 기록지의 입력은 남는다** —
 * 시트에 식별자가 없어 자동 병합이 불가능하므로, 잃는 범위를 최소화하고 무엇을 잃는지
 * 미리 밝히는 것이 여기서 할 수 있는 최선이다. 강제 덮어쓰기는 제공하지 않는다.
 *
 * 되돌릴 것이 없거나 사용자가 내 입력을 유지하기로 하면 `null` — 저장되지 않은 채로 남아 값을 직접 옮겨 적을 수 있다.
 */
export const useSheetConflict = ({ scheduleId, fetchSchedule, confirm }: Params) => {
  const recoverFromConflict = async (
    message: string, context: ConflictContext,
  ): Promise<ConflictRecovery | null> => {
    if (scheduleId == null) return null;

    const latest = await fetchSchedule(scheduleId);
    if (!latest) {
      toast.error(message);
      return null;
    }

    const serverSheets = latest.snapshot.samplingData?.sheets ?? [];
    const diff = diffSheetVersions(
      context.sheets, serverSheets, context.deletedSheets, context.changedCategories,
    );
    const categories = getResolvableCategories(diff);

    // 기록지 내용은 그대로인데 저장이 물리적으로 겹친 경우다. 되돌릴 것이 없으니 다시 저장하면 된다.
    if (categories.length === 0) {
      toast.error(message);
      return null;
    }

    const isConfirmed = await confirm({
      title: "다른 사용자가 먼저 저장했습니다",
      description: describeSheetDiff(diff),
      confirmLabel: "변경된 내용으로 덮어쓰기(내 입력값 사라짐)",
      cancelLabel: "내 입력 유지",
      // 되돌려도 잃을 값이 없으면 경고 톤을 쓰지 않는다 — 매번 붉게 물으면 경고가 무뎌진다.
      tone: diff.conflicted.length > 0 ? "danger" : "default",
    });
    if (!isConfirmed) return null;

    return {
      sheets: hydrateSheets(resolveWithServer(context.sheets, serverSheets, categories), context.groups),
      categories,
    };
  };

  /** 되돌린 뒤의 안내 — 반영은 호출부가 끝낸 뒤 부른다 */
  const announceRecovered = (categories: MeasurementCategory[]) => {
    const labels = categories.map((category) => MEASUREMENT_CATEGORY_LABEL[category]).join("·");
    toast.success(`${labels} 기록지를 최신 내용으로 되돌렸습니다. 이어서 저장할 수 있습니다.`);
  };

  return { recoverFromConflict, announceRecovered };
};
