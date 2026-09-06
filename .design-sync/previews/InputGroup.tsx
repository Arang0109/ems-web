import { useState } from "react";
import { Building2, Search as SearchIcon } from "lucide-react";
import { InputGroup } from "ems-web";

/** 라벨 + 도움말이 붙은 기본형 */
export const WithLabel = () => {
  const [value, setValue] = useState("한국환경공단");
  return (
    <div className="max-w-sm">
      <InputGroup
        label="측정대행 의뢰기관"
        value={value}
        onChange={setValue}
        placeholder="기관명을 입력하세요"
        helperText="사업자등록증의 상호와 동일하게 입력합니다."
        required
      />
    </div>
  );
};

/** 오류 상태 — `invalid` + `error` 가 함께 간다 */
export const Invalid = () => (
  <div className="max-w-sm">
    <InputGroup
      label="사업자번호"
      value="123-45"
      invalid
      error="사업자번호 10자리를 모두 입력하세요."
    />
  </div>
);

/** 앞뒤 아이콘 슬롯 */
export const WithIcons = () => (
  <div className="flex max-w-sm flex-col gap-3">
    <InputGroup label="사업장" value="포항공장" startIcon={<Building2 size={16} />} />
    <InputGroup label="검색" value="" placeholder="배출구명 검색" endIcon={<SearchIcon size={16} />} />
  </div>
);

/** 읽기 전용·비활성 — 자동 계산 결과나 잠긴 필드 */
export const ReadOnlyAndDisabled = () => (
  <div className="flex max-w-sm flex-col gap-3">
    <InputGroup label="관리번호 (자동 부여)" value="EMS-2026-00412" readOnly />
    <InputGroup label="등록일" value="2026-03-14" disabled />
  </div>
);
