import { ListFilter } from "lucide-react";
import { FilterPopover, HorizontalRadioGroup } from "ems-web";

/**
 * 표 필터 바의 조건 팝오버. 정지 화면에서는 트리거만 보인다 —
 * 열림 상태는 컴포넌트가 소유한다.
 */
export const Trigger = () => (
  <FilterPopover icon={ListFilter} label="필터" title="측정일정 필터">
    <HorizontalRadioGroup
      value="ALL"
      options={[
        { value: "ALL", label: "전체" },
        { value: "AIR", label: "대기" },
        { value: "WATER", label: "수질" },
      ]}
    />
  </FilterPopover>
);

/** `activeCount > 0` — 트리거가 선택 상태가 되고 개수 배지를 단다 */
export const WithActiveCount = () => (
  <div className="flex items-center gap-3">
    <FilterPopover icon={ListFilter} label="필터" activeCount={2} title="측정일정 필터">
      <span className="text-body-3">조건 본문</span>
    </FilterPopover>
    <FilterPopover icon={ListFilter} ariaLabel="측정분야 필터" activeCount={1} title="측정분야">
      <span className="text-body-3">조건 본문</span>
    </FilterPopover>
  </div>
);
