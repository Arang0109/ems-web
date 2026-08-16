import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@shared/ui/buttons";
import { EmptyText } from "@shared/ui/feedback";
import { useRemountKey } from "@shared/model";

import { RegisterStackPollutantForm } from "@features/register-stack-pollutant";

import type { MeasurementProfile } from "../../model/types";

interface Props {
  stackId: number | null;
  /** 측정시설의 기준산소농도(%) — null 이면 항목별 산소보정 열을 보여줄 이유가 없다 */
  standardOxygen: number | null;
  measurements: MeasurementProfile[];
  onRefetch?: () => void;
}

export const MeasurementInfo = ({ stackId, standardOxygen, measurements, onRefetch }: Props) => {
  const [registerOpen, setRegisterOpen] = useState(false);

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerOpen);

  const hasStandardOxygen = standardOxygen !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-h3 text-ink">측정항목</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRegisterOpen(true)}
          disabled={!stackId}
        >
          <Plus size={14} className="mr-1" />
          측정항목 추가
        </Button>
      </div>

      {measurements.length === 0 ? (
        <EmptyText>등록된 측정항목이 없습니다.</EmptyText>
      ) : (
        // 좁은 화면에서 표가 페이지를 밀어내지 않도록 이 컨테이너 안에서만 가로 스크롤한다
        <div className="overflow-x-auto">
          <table className="w-full min-w-2xl text-body-3">
            <thead>
              <tr className="border-b border-rule">
                <th className="px-3 py-2 text-left text-label text-muted-ink">오염물질명</th>
                <th className="px-3 py-2 text-left text-label text-muted-ink">영문명</th>
                <th className="px-3 py-2 text-left text-label text-muted-ink">측정 주기</th>
                <th className="px-3 py-2 text-left text-label text-muted-ink">허용 기준</th>
                {hasStandardOxygen && (
                  <th className="px-3 py-2 text-left text-label text-muted-ink">
                    산소보정 ({standardOxygen}%)
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {measurements.map((m, index) => (
                <tr
                  key={index}
                  className="border-b border-rule transition-colors last:border-0 hover:bg-canvas"
                >
                  <td className="px-3 py-3 text-body-4 text-ink">{m.nameKr}</td>
                  <td className="px-3 py-3 text-muted-ink">{m.nameEn}</td>
                  <td className="px-3 py-3 text-ink">{m.cycle}</td>
                  <td className="px-3 py-3 text-ink">{m.allowance}</td>
                  {hasStandardOxygen && (
                    <td className="px-3 py-3 text-ink">{m.oxygenApplicable}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RegisterStackPollutantForm
        key={registerFormKey}
        stackId={stackId}
        standardOxygen={standardOxygen}
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={onRefetch}
      />
    </div>
  );
};
