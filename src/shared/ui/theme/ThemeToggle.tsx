import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { IconButton } from "@shared/ui/buttons";

/** 라이트↔다크 2단 테마 토글 버튼 */
export const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 초기 렌더에서는 resolvedTheme이 확정되지 않으므로 마운트 후 아이콘을 결정
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <IconButton
      label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      icon={isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    />
  );
};
