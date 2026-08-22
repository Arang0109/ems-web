import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { IconButton } from "@shared/ui/buttons";

/** 라이트↔다크 2단 테마 토글 버튼 */
export const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();

  // SPA 라 하이드레이션이 없다 — 테마가 확정되기 전 첫 렌더에서는 resolvedTheme 이
  // undefined 라 라이트로 보고, 확정되면 다시 렌더된다(마운트 플래그가 필요 없는 이유).
  const isDark = resolvedTheme === "dark";

  return (
    <IconButton
      label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      icon={isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    />
  );
};
