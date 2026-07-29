import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@shared/ui/buttons";

import { RegisterStackPollutantForm } from "@features/register-stack-pollutant";

import type { MeasurementProfile } from "../../model/types";

interface Props {
  stackId: number | null;
  measurements: MeasurementProfile[];
  onRefetch?: () => void;
}

export const MeasurementInfo = ({ stackId, measurements, onRefetch }: Props) => {
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-h3 text-foreground">측정항목</h3>
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
        <p className="text-body-2 text-muted-foreground text-center py-8">
          등록된 측정항목이 없습니다.
        </p>
      ) : (
        <table className="w-full text-body-3">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-label text-muted-foreground">오염물질명</th>
              <th className="text-left py-2 px-3 text-label text-muted-foreground">영문명</th>
              <th className="text-left py-2 px-3 text-label text-muted-foreground">측정 주기</th>
              <th className="text-left py-2 px-3 text-label text-muted-foreground">허용 기준</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m, index) => (
              <tr
                key={index}
                className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
              >
                <td className="py-3 px-3 text-body-4 text-foreground">{m.nameKr}</td>
                <td className="py-3 px-3 text-muted-foreground">{m.nameEn}</td>
                <td className="py-3 px-3 text-foreground">{m.cycle}</td>
                <td className="py-3 px-3 text-foreground">{m.allowance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <RegisterStackPollutantForm
        stackId={stackId}
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={onRefetch}
      />
    </div>
  );
};
