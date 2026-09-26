interface Props {
  open: boolean;
  children: React.ReactNode;
  id?: string;
}

/**
 * 높이 애니메이션으로 접고 펴는 본문 — 아코디언류가 공유한다.
 *
 * `grid-template-rows: 0fr ↔ 1fr` 전환이라 내용 높이를 재지 않아도 부드럽게 접힌다.
 * **접힌 동안은 `inert`** 다 — 높이만 0 으로 줄이면 숨은 입력칸에 Tab 포커스가 들어가
 * 보이지 않는 칸에 값이 들어간다.
 */
export const Collapsible = ({ open, children, id }: Props) => (
  <div
    id={id}
    className="grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none"
    style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    inert={!open}
  >
    <div className="overflow-hidden">{children}</div>
  </div>
);
