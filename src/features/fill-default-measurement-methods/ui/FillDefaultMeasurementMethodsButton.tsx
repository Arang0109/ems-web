import { Sparkles } from "lucide-react";

import { useFillDefaultMeasurementMethods } from "../model/use-fill-default-measurement-methods";

import { Button } from "@shared/ui/buttons";

interface Props {
  currentCount: number;
}

/** 기본 8종 채우기 버튼. 몇 번 눌러도 늘어나지 않는다(이름 기준 멱등). */
export const FillDefaultMeasurementMethodsButton = ({ currentCount }: Props) => {
  const { isLoading, handleFill } = useFillDefaultMeasurementMethods({ currentCount });

  return (
    <Button variant="outline" startIcon={Sparkles} onClick={handleFill} disabled={isLoading}>
      기본 8종 채우기
    </Button>
  );
};
