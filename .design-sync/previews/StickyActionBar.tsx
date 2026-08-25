import { Save, X } from "lucide-react";
import { Button, StickyActionBar } from "ems-web";

/** 폼 하단에 붙는 저장/취소 바 */
export const SaveCancel = () => (
  <StickyActionBar>
    <Button variant="outline" startIcon={X}>
      취소
    </Button>
    <Button startIcon={Save}>저장</Button>
  </StickyActionBar>
);

/** 미저장 변경이 있을 때 — 저장 버튼이 앰버로 바뀐다 */
export const UnsavedChanges = () => (
  <StickyActionBar>
    <span className="text-body-3 text-muted-ink">저장하지 않은 변경이 있습니다</span>
    <Button variant="outline">되돌리기</Button>
    <Button variant="warning" startIcon={Save}>
      저장
    </Button>
  </StickyActionBar>
);

/** 페이지 본문 아래에 놓였을 때의 모습 */
export const InPage = () => (
  <div className="flex flex-col gap-4">
    <p className="text-body-1">
      배출구 정보를 수정한 뒤 하단 바에서 저장합니다. 바는 스크롤과 무관하게 화면 하단에 붙는다.
    </p>
    <StickyActionBar>
      <Button variant="outline">취소</Button>
      <Button startIcon={Save}>저장</Button>
    </StickyActionBar>
  </div>
);
