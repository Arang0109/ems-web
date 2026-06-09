import type { StackProfile } from "../../model/types";

import { Divider } from "@shared/ui/borders";

interface Props {
  stackProfile: StackProfile;
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 rounded-xl px-4 py-3">
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value}</p>
  </div>
);

export const StackBasicInfo = ({ stackProfile }: Props) => {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-gray-800">기본 정보</h3>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500">시설 식별</p>
        <div className="grid grid-cols-3 gap-3">
          <InfoItem label="측정 분야" value={stackProfile.field} />
          <InfoItem label="SEMS 번호" value={stackProfile.semsNumber} />
          <InfoItem label="등급" value={stackProfile.grade} />
        </div>
        <div className="grid grid-cols-3 gap-3">
            <InfoItem label="측정시설명" value={stackProfile.name} />
            <InfoItem label="업종 분류" value={stackProfile.businessCategory} />
            <InfoItem label="주요 생산품" value={stackProfile.mainProduct} />
          </div>
      </div>

      <Divider />

      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500">구조 정보</p>
        <div className="grid grid-cols-2 gap-3">
          <InfoItem label="방향" value={stackProfile.orientation} />
          <InfoItem label="형태" value={stackProfile.shape} />
          <InfoItem
            label="높이"
            value={stackProfile.height !== "-" ? `${stackProfile.height} m` : "-"}
          />
          <InfoItem label="지름 / 크기" value={stackProfile.diameter} />
        </div>
      </div>
    </div>
  );
};
