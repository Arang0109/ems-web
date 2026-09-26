import { Copy } from "lucide-react";

import { Button } from "@shared/ui/buttons";
import { Callout } from "@shared/ui/feedback";

interface Props {
  /** 출처 기록지 이름 (예: "먼지 기록지") */
  sourceLabel: string;
  /** 이 기록지의 공통 칸에 이미 적은 값이 있는가 */
  hasValues: boolean;
  onSync: () => void;
}

/**
 * 같은 회차 앞 기록지의 기상·수분·배출가스·측정점 온도/동정압을 이 기록지에 채우자는 제안.
 *
 * "이전 회차 기록 불러오기"(지난 측정의 기록지 전체)와 헷갈리지 않도록 버튼 줄에 나란히 두지 않고,
 * 출처 기록지 이름을 문장에 넣어 따로 보여 준다. 공통 칸이 비어 있을 때만 배너로 권하고,
 * 값을 적은 뒤에는 다시 채우기용 작은 버튼만 남긴다.
 * 배너는 중립 톤이다 — info 톤은 "불러온 값, 확인 필요" 표시로 이미 쓰이고 있다.
 */
export const SyncCommonSectionsPrompt = ({ sourceLabel, hasValues, onSync }: Props) => {
  if (hasValues)
    return (
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" startIcon={Copy} onClick={onSync}>
          {sourceLabel} 값 다시 채우기
        </Button>
      </div>
    );

  return (
    <Callout
      icon={Copy}
      action={
        <Button type="button" variant="outline" size="sm" onClick={onSync}>
          {sourceLabel} 값 채우기
        </Button>
      }
    >
      {sourceLabel}와 같은 시각에 쟀다면 기상·수분·배출가스와 측정점 온도·동정압을 그대로 채울 수 있어요.
    </Callout>
  );
};
