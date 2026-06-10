import { useParams } from 'react-router';

import { StackBasicInfo } from './children/StackBasicInfo';
import { PreventionInfo } from './children/PreventionInfo';
import { FacilityInfo } from './children/FacilityInfo';
import { MeasurementInfo } from './children/MeasurementInfo';

import { useStackProfile } from '../model/use-stack-profile';

import { Tabs } from '@shared/ui/tabs';

export const StackProfile = () => {
  const { stackId } = useParams<{ stackId: string }>();

  const { stack, stackProfile, preventions, facilities, measurements, refetch } = useStackProfile(stackId);

  const tabOptions = [
    {
      value: "stack",
      label: "측정시설",
      content: <StackBasicInfo key={stack?.id} stack={stack} stackProfile={stackProfile} onSuccess={refetch} />
    },
    {
      value: "facility",
      label: "배출시설",
      content: <FacilityInfo facilities={facilities} />
    },
    {
      value: "prevention",
      label: "방지시설",
      content: <PreventionInfo preventions={preventions} />
    },
    {
      value: "measurements",
      label: "측정항목",
      content: <MeasurementInfo measurements={measurements} />
    },
    {
      value: "history",
      label: "측정이력",
      content: <PreventionInfo preventions={preventions} />
    }
  ]

  return(
    <div>
      <Tabs gap={5} options={tabOptions} />
    </div>
  );
}