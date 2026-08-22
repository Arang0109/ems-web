import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { IconButton } from "./IconButton";

interface Props {
  /** 이동할 경로. 없으면 히스토리 뒤로(-1) */
  to?: string;
  /** 완전 커스텀 동작 — 지정 시 to·히스토리를 무시한다 */
  onClick?: () => void;
  className?: string;
}

/**
 * 뒤로가기 버튼. 동작 우선순위는 `onClick` > `to` > 히스토리(-1).
 *
 * URL 로 직접 진입할 수 있는 화면은 히스토리가 비어 있어 `navigate(-1)` 이 앱 밖으로
 * 나가므로 `to` 를 넘긴다.
 */
export const BackButton = ({ to, onClick, className }: Props) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) return onClick();
    if (to) return navigate(to);
    navigate(-1);
  };

  return (
    <IconButton
      icon={<ChevronLeft className="size-5" />}
      label="뒤로가기"
      onClick={handleClick}
      size="icon-sm"
      className={className}
    />
  );
};
