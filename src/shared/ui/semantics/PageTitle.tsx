/** 페이지 상단 제목. 모바일은 피그마 MO 시안(제목 18px · 설명 11px) 크기로 낮춘다. */
export const PageTitle = ({ title, description }: { title: string; description?: string }) => {
  return (
    <div>
      <h1 className="text-h3 md:text-h1 text-ink">{title}</h1>
      {description && <p className="text-caption md:text-body-2 text-ink-soft mt-0.5">{description}</p>}
    </div>
  );
}
