import { useCallback, useState } from "react";

import type { EditorSectionId } from "../section-progress";

/** 섹션 카드의 DOM id — 섹션 바로가기의 스크롤 이동 대상 */
export const sectionDomId = (id: EditorSectionId): string => `sheet-section-${id}`;

export interface SectionNav {
  /** 바로가기에서 강조할 섹션 — 마지막으로 펼치거나 이동한 곳 */
  activeSectionId: EditorSectionId;
  isOpen: (id: EditorSectionId) => boolean;
  setSectionOpen: (id: EditorSectionId, open: boolean) => void;
  /** 대상 섹션을 펼치고 그 카드로 스크롤한다 */
  goToSection: (id: EditorSectionId) => void;
}

/**
 * 섹션 바로가기·펼침 상태.
 *
 * SheetFormView 가 아니라 SheetsEditor 가 소유한다 — 바로가기가 공통 정보까지 가리켜야 하는데
 * 공통 정보는 기록지 바깥에 있고, SheetFormView 는 기록지 전환마다 리마운트되기 때문이다.
 * 그 덕에 기록지를 바꿔도 펼쳐 둔 섹션이 유지된다.
 *
 * 공통 정보만 펼친 채 시작한다 — 모바일에서 위에서부터 한 섹션씩 채우는 흐름.
 */
export const useSectionNav = (): SectionNav => {
  const [activeSectionId, setActiveSectionId] = useState<EditorSectionId>("basic");
  const [openSections, setOpenSections] = useState<Partial<Record<EditorSectionId, boolean>>>({
    basic: true,
  });

  const isOpen = useCallback((id: EditorSectionId) => openSections[id] ?? false, [openSections]);

  const setSectionOpen = useCallback((id: EditorSectionId, open: boolean) => {
    setOpenSections((prev) => ({ ...prev, [id]: open }));
    if (open) setActiveSectionId(id);
  }, []);

  const goToSection = useCallback((id: EditorSectionId) => {
    setOpenSections((prev) => ({ ...prev, [id]: true }));
    setActiveSectionId(id);
    // 펼침 애니메이션이 시작된 뒤 위치를 잡아야 목표 카드가 화면에 걸린다.
    requestAnimationFrame(() => {
      document.getElementById(sectionDomId(id))?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return { activeSectionId, isOpen, setSectionOpen, goToSection };
};
