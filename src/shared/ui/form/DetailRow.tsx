import React from "react";

import { cn } from "@/lib/utils";

/** 데스크탑 열 배치 — 조합한 이름은 CSS 가 생성되지 않으므로 정적 맵으로 고정한다. */
const COL_SPAN = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  full: "md:col-span-full",
} as const;

/** 값 헬퍼가 빈 값을 정규화한 결과. 실제 값과 같은 굵기면 데이터가 있는 것처럼 읽힌다. */
const EMPTY_MARK = "-";

interface Props {
  label: React.ReactNode;
  value: React.ReactNode;
  /** 데스크탑 그리드에서 차지할 열 수. 주소처럼 긴 값에 쓴다 (기본 1) */
  span?: keyof typeof COL_SPAN;
  className?: string;
}

/**
 * 읽기 전용 상세 표시 행.
 *
 * 피그마 "측정계획 상세" 시안의 Input 행(모바일 48px, 라벨 12/600 Muted, 값 14/700 Ink).
 * 입력이 아닌 표시 전용이라 값은 ReactNode 를 받아 배지·칩도 그대로 넣을 수 있다.
 *
 * 레이아웃은 뷰포트에 따라 갈린다.
 * - 모바일: 한 행에 좌측 라벨 / 우측 값, 하단 구분선, 48px 터치 타깃.
 *   화면 폭 전체를 쓰므로 양끝 정렬이 읽기 쉽다.
 * - 데스크탑(md+): **고정폭 라벨 열(7rem) + 값 열** 2열 그리드로 가로 정렬한다.
 *   상세 화면은 이 행을 다시 다열 그리드(md 2열 ~ xl 3열) 안에 배치하는데,
 *   라벨 폭이 고정이라 모든 행에서 값의 시작 x축이 일치한다 → 값만 세로로 훑어 읽을 수 있다.
 *
 * 데스크탑에서 구분선을 지우는 이유: 다열 그리드에서는 셀마다 하단선이 열 사이 gap 에서
 * 끊기고, 값이 두 줄로 넘치면 옆 열과 높이가 어긋나 계단 모양이 된다. 구조를 만드는 선이
 * 아니라 노이즈이므로 행 간 여백으로 대체한다. 섹션 경계는 `SectionAccordion` 이 갖는다.
 *
 * 값이 ReactNode 인 경우 정렬은 호출부 책임이다 — 칩·배지를 넣는다면 컨테이너에
 * `justify-end md:justify-start` 처럼 같은 분기를 적용한다.
 */
export const DetailRow = ({ label, value, span = 1, className }: Props) => (
  <div
    className={cn(
      "flex min-h-12 items-center justify-between gap-3 border-b border-rule p-3",
      "md:grid md:min-h-0 md:grid-cols-[7rem_minmax(0,1fr)] md:items-start md:gap-x-3",
      "md:border-b-0 md:px-0 md:py-1.5",
      COL_SPAN[span],
      className,
    )}
  >
    {/* pt-0.5 : 12px 라벨과 14px 값의 첫 줄 시각 중심을 맞춘다 */}
    <span className="text-label text-muted-ink md:pt-0.5">{label}</span>
    <span
      className={cn(
        "min-w-0 text-right text-body-1 break-all",
        // 데스크탑은 열이 넓으므로 단어 중간을 자르지 않는다 (주소·업종 가독성)
        "md:text-left md:[word-break:normal] md:break-words",
        value === EMPTY_MARK ? "text-muted-ink" : "text-ink",
      )}
    >
      {value}
    </span>
  </div>
);
