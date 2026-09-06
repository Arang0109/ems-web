import { Badge } from "ems-web";

/** 톤 축 전체 — 상태를 도메인이 아니라 의미 톤으로 표현한다 */
export const Tones = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge tone="brand">측정 완료</Badge>
    <Badge tone="neutral">미배정</Badge>
    <Badge tone="info">분석 중</Badge>
    <Badge tone="warning">확인 필요</Badge>
    <Badge tone="danger">측정 취소</Badge>
    <Badge tone="solid">신규</Badge>
  </div>
);

/** 테두리 없는 면 전용 변형 — 표 셀처럼 선이 많은 자리에 쓴다 */
export const Nonline = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge tone="danger_nonline">기한 초과</Badge>
    <Badge tone="warning_nonline">재측정</Badge>
  </div>
);

/** 표 안에서의 실제 쓰임 — 값 옆에 붙는 짧은 라벨 */
export const InContext = () => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <span className="text-body-1">1호기 보일러 배출구</span>
      <Badge tone="brand">측정 완료</Badge>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-body-1">2호기 소각로 배출구</span>
      <Badge tone="warning">성적서 발행 대기</Badge>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-body-1">3호기 건조로 배출구</span>
      <Badge tone="danger">측정 취소</Badge>
    </div>
  </div>
);
