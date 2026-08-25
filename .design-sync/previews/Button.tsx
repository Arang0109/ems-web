import { Plus, RotateCcw, Save, Send, Trash2, Upload, X } from "lucide-react";
import { Button } from "ems-web";

/** 피그마 "상태별 버튼" 스펙 — variant 축 전체 */
export const Variants = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button>일정 등록</Button>
    <Button variant="outline">취소</Button>
    <Button variant="selected">선택됨</Button>
    <Button variant="destructive">삭제</Button>
    <Button variant="warning">미저장 변경</Button>
    <Button variant="soft">항목 추가</Button>
    <Button variant="ghost">더보기</Button>
    <Button variant="link">약관 보기</Button>
  </div>
);

/** 크기 축 — xs / sm / default / lg */
export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button size="xs">xs</Button>
    <Button size="sm">sm</Button>
    <Button size="default">default</Button>
    <Button size="lg">lg</Button>
  </div>
);

/** 라벨 앞 아이콘 — `startIcon` 에 LucideIcon 컴포넌트 자체를 넘긴다 */
export const WithIcon = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button startIcon={Plus}>측정일정 등록</Button>
    <Button variant="outline" size="sm" startIcon={Save}>
      저장
    </Button>
    <Button variant="outline" size="sm" startIcon={RotateCcw}>
      되돌리기
    </Button>
    <Button variant="destructive" size="sm" startIcon={Trash2}>
      삭제
    </Button>
    <Button variant="outline" startIcon={Upload}>
      파일 업로드
    </Button>
  </div>
);

/** 비활성 상태 — 회색 면 + muted 텍스트로 통일된다 */
export const Disabled = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button disabled startIcon={Send}>
      제출
    </Button>
    <Button variant="outline" disabled>
      취소
    </Button>
    <Button variant="destructive" disabled startIcon={X}>
      측정 취소
    </Button>
  </div>
);
