import { Info } from "lucide-react";
import { Button, IconButton, Tooltip } from "ems-web";

/**
 * 말풍선은 hover/focus 로만 열리므로 정지 화면에는 트리거만 보인다.
 * `children` 은 ref 를 받을 수 있는 요소여야 한다 (네이티브 태그 또는 ref 전달 컴포넌트).
 */
export const Sides = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Tooltip content="위쪽에 붙는다" side="top">
      <Button variant="outline" size="sm">
        top
      </Button>
    </Tooltip>
    <Tooltip content="오른쪽에 붙는다" side="right">
      <Button variant="outline" size="sm">
        right
      </Button>
    </Tooltip>
    <Tooltip content="아래쪽에 붙는다" side="bottom">
      <Button variant="outline" size="sm">
        bottom
      </Button>
    </Tooltip>
    <Tooltip content="왼쪽에 붙는다" side="left">
      <Button variant="outline" size="sm">
        left
      </Button>
    </Tooltip>
  </div>
);

/** 아이콘 버튼에 설명을 붙이는 실제 쓰임 */
export const OnIconButton = () => (
  <div className="flex items-center gap-2">
    <Tooltip content="표준산소농도 보정에 쓰이는 값입니다">
      <IconButton icon={<Info size={16} />} label="표준산소농도 설명" variant="ghost" size="icon-sm" />
    </Tooltip>
    <span className="text-body-1">표준산소농도</span>
  </div>
);
