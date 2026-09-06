import { StatusDot } from "ems-web";

/**
 * 톤 축 전체.
 * 피그마 원칙상 색만으로 구분하지 않으므로 `label` 은 필수다 —
 * 같은 톤을 여러 상태가 공유해도 텍스트로 갈린다.
 */
export const Tones = () => (
  <div className="flex flex-col gap-2">
    <StatusDot tone="pending" label="측정 대기" />
    <StatusDot tone="active" label="현장 측정 중" />
    <StatusDot tone="info" label="시료 분석 중" />
    <StatusDot tone="progress" label="성적서 작성 중" />
    <StatusDot tone="success" label="측정 완료" />
    <StatusDot tone="done" label="종료" />
    <StatusDot tone="danger" label="측정 지연" />
    <StatusDot tone="warning" label="확인 필요" />
  </div>
);

/** `pill` — 톤 면색을 깐 알약. 모바일 카드 헤더에서 쓴다 */
export const Pill = () => (
  <div className="flex flex-wrap items-center gap-2">
    <StatusDot tone="pending" label="측정 대기" pill />
    <StatusDot tone="active" label="현장 측정 중" pill />
    <StatusDot tone="success" label="측정 완료" pill />
    <StatusDot tone="danger" label="측정 지연" pill />
  </div>
);

/** 목록 행에서의 실제 쓰임 */
export const InRow = () => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center justify-between gap-4">
      <span className="text-body-1">한국환경공단 · 1호기 보일러</span>
      <StatusDot tone="success" label="측정 완료" />
    </div>
    <div className="flex items-center justify-between gap-4">
      <span className="text-body-1">대한제철 포항공장 · 2호기 소각로</span>
      <StatusDot tone="active" label="현장 측정 중" />
    </div>
    <div className="flex items-center justify-between gap-4">
      <span className="text-body-1">그린에너지발전 · 3호기 건조로</span>
      <StatusDot tone="danger" label="측정 지연" />
    </div>
  </div>
);
