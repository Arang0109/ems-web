import type { FacilityProfile } from "../../model/types";

import { Divider } from "@shared/ui/borders";

interface Props {
  facilities: FacilityProfile[];
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 rounded-xl px-4 py-3">
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value}</p>
  </div>
);

export const FacilityInfo = ({ facilities }: Props) => {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-gray-800">배출시설</h3>

      {facilities.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          등록된 배출시설이 없습니다.
        </p>
      ) : (
        facilities.map((facility, index) => (
          <div key={index} className="space-y-5">
            {index > 0 && <Divider />}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500">시설 정보</p>
              <InfoItem label="배출시설명" value={facility.name} />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500">연료 정보</p>
              <div className="grid grid-cols-3 gap-3">
                <InfoItem label="연료 유형" value={facility.fuelType} />
                <InfoItem label="연료 사용량" value={facility.fuelUsage} />
                <InfoItem label="연료 투입량" value={facility.fuelInput} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
