import type { PreventionProfile } from "../../model/types";

import { Divider } from "@shared/ui/borders";

interface Props {
  preventions: PreventionProfile[];
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 rounded-xl px-4 py-3">
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value}</p>
  </div>
);

export const PreventionInfo = ({ preventions }: Props) => {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-gray-800">방지시설</h3>

      {preventions.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          등록된 방지시설이 없습니다.
        </p>
      ) : (
        preventions.map((prevention, index) => (
          <div key={index} className="space-y-5">
            {index > 0 && <Divider />}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500">시설 정보</p>
              <InfoItem label="방지시설명" value={prevention.name} />
            </div>

            {prevention.targets.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500">대상 물질</p>
                <div className="grid grid-cols-2 gap-3">
                  {prevention.targets.map((target, tIdx) => (
                    <InfoItem
                      key={tIdx}
                      label={target.name}
                      value={target.removalEfficiency}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
