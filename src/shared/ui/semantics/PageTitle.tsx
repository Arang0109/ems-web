interface Props {
  title: string;
  description?: string;
  /** 제목 우측 보조 정보 — 상세 화면의 대상 식별자·상태 배지 등 */
  subtitle?: React.ReactNode;
}

/** 페이지 상단 제목. 모바일은 피그마 MO 시안(제목 18px · 설명 11px) 크기로 낮춘다. */
export const PageTitle = ({ title, description, subtitle }: Props) => {
  return (
    <div className="grow">
      {/* 좁은 화면에서 보조 정보가 제목 아래 줄로 내려가도록 wrap 한다 */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h1 className="text-h3 md:text-h1 text-ink">{title}</h1>
        {subtitle}
      </div>
      {description && <p className="text-caption md:text-body-2 text-ink-soft mt-0.5">{description}</p>}
    </div>
  );
}
