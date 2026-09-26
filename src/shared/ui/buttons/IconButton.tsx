import { Button } from "./Button";

type Props = Omit<React.ComponentProps<typeof Button>, "children" | "aria-label" | "startIcon"> & {
  icon: React.ReactNode;
  /** 스크린리더용 이름 — 아이콘만 보이므로 반드시 필요하다 */
  label: string;
};

/**
 * 아이콘 전용 버튼. 피그마 ICON ONLY 스타일은 variant="outline" 으로 쓴다.
 *
 * 나머지 props 는 그대로 `<button>` 에 흘려보낸다 — Base UI `render` 슬롯(`Dialog.Close` 등)이
 * 얹는 핸들러·ref 와 dnd-kit 리스너가 이 경로로 들어온다.
 */
export const IconButton = ({ icon, label, variant = "ghost", size = "icon", ...props }: Props) => (
  <Button variant={variant} size={size} aria-label={label} {...props}>
    {icon}
  </Button>
);
