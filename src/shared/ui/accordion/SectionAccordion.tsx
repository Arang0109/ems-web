import { useState } from "react";
import { ChevronDown } from "lucide-react";

// 접기/펼치기 헤더 바를 가진 섹션 래퍼 — 기록지형 화면의 섹션 구분에 사용
export const SectionAccordion = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between
          bg-secondary text-secondary-foreground border border-border
          text-label py-2 px-3 tracking-wide
          ${open ? "rounded-t-nav" : "rounded-nav"}`}
      >
        <span>{title}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
};
