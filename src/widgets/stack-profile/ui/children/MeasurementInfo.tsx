import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { RegisterStackMeasurementForm } from "@features/register-stack-measurement";

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
        <h3 className="text-sm font-semibold text-gray-800">측정항목</h3>
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
        <p className="text-sm text-gray-400 text-center py-8">
          등록된 측정항목이 없습니다.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">오염물질명</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">영문명</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">측정 주기</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">허용 기준</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m, index) => (
              <tr
                key={index}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-3 font-medium text-gray-800">{m.nameKr}</td>
                <td className="py-3 px-3 text-gray-500">{m.nameEn}</td>
                <td className="py-3 px-3 text-gray-700">{m.cycle}</td>
                <td className="py-3 px-3 text-gray-700">{m.allowance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <RegisterStackMeasurementForm
        stackId={stackId}
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={onRefetch}
      />
    </div>
  );
};
