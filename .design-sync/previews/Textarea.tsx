import { useState } from "react";
import { Textarea } from "ems-web";

/** 라벨 + 도움말 + 글자수 제한 */
export const WithLabel = () => {
  const [value, setValue] = useState(
    "1호기 보일러 가동률이 낮아 배출농도가 평소보다 낮게 측정되었습니다.",
  );
  return (
    <div className="max-w-sm">
      <Textarea
        label="측정 시 특이사항"
        value={value}
        onChange={setValue}
        rows={4}
        maxLength={200}
        helperText="성적서 비고란에 그대로 실립니다."
      />
    </div>
  );
};

/** 빈 상태 — placeholder */
export const Empty = () => (
  <div className="max-w-sm">
    <Textarea label="취소 사유" value="" placeholder="취소 사유를 입력하세요" rows={3} required />
  </div>
);

/** 읽기 전용·비활성 */
export const ReadOnlyAndDisabled = () => (
  <div className="flex max-w-sm flex-col gap-3">
    <Textarea label="반려 사유 (읽기 전용)" value="첨부된 성적서 파일이 열리지 않습니다." readOnly rows={2} />
    <Textarea label="비고 (비활성)" value="" placeholder="입력할 수 없습니다" disabled rows={2} />
  </div>
);
