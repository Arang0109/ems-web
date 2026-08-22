import { useParams } from "react-router";

import { Tabs } from "@shared/ui/tabs";

import { StackBasicInfo } from "./children/StackBasicInfo";
import { PreventionInfo } from "./children/PreventionInfo";
import { FacilityInfo } from "./children/FacilityInfo";
import { MeasurementInfo } from "./children/MeasurementInfo";
import { MeasurementHistory } from "./children/history";

import { useStackProfile } from "../model/use-stack-profile";

export const StackProfile = () => {
  const { stackId } = useParams<{ stackId: string }>();

  const {
    stack,
    stackId: stackIdNum,
    stackProfile,
    facilities,
    preventions,
    measurements,
    stackPollutants,
    refetch,
  } = useStackProfile(stackId);

  const tabOptions = [
    {
      value: "stack",
      label: "측정지점",
      /**
       * 측정지점·배출시설·방지시설은 하나의 굴뚝을 서로 다른 각도에서 본 것이라
       * 탭으로 갈라두면 대조하며 볼 수 없다. 한 탭에 세 개의 SectionAccordion 으로 쌓고
       * 접기로 스크롤 길이를 조절한다.
       */
      content: (
        <div className="space-y-4">
          <StackBasicInfo
            key={stack?.id}
            stack={stack}
            stackProfile={stackProfile}
            onSuccess={refetch}
          />
          {stackIdNum !== null && (
            <>
              <FacilityInfo stackId={stackIdNum} facilities={facilities} onRefetch={refetch} />
              <PreventionInfo stackId={stackIdNum} preventions={preventions} onRefetch={refetch} />
            </>
          )}
        </div>
      ),
      // 본문이 카드(SectionAccordion)를 직접 가지므로 탭의 카드 셸을 끈다 — 겹치면 이중 카드가 된다
      panel: false,
    },
    {
      value: "measurements",
      label: "측정항목",
      content: (
        <MeasurementInfo
          stackId={stackIdNum}
          standardOxygen={stack?.standardOxygen ?? null}
          measurements={measurements}
          stackPollutants={stackPollutants}
          onRefetch={refetch}
        />
      ),
    },
    {
      value: "history",
      label: "측정이력",
      content: <MeasurementHistory stackId={stackIdNum} />,
    },
    {
      value: "documents",
      label: "관련문서",
      content: null,
    },
  ];

  return <Tabs options={tabOptions} />;
};
