/**
 * design-sync 프리뷰 전용 컨텍스트 래퍼.
 *
 * `src/app/providers/app-provider.tsx` 의 체인을 그대로 따라가되,
 * API 호출이 필요한 `AuthProvider` 와 화면에 고정 렌더되는 `Toaster` 는 제외한다.
 * 라우터는 브라우저 히스토리에 의존하지 않도록 `MemoryRouter` 를 쓴다.
 *
 * `.design-sync/config.json` 의 `provider.component` 가 이 컴포넌트를 가리킨다.
 */
import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { MemoryRouter } from "react-router-dom";

import { ConfirmProvider } from "@shared/ui/dialogs";

export const DesignPreviewProvider = ({ children }: { children: ReactNode }) => (
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem={false}
    disableTransitionOnChange
  >
    <MemoryRouter initialEntries={["/"]}>
      <ConfirmProvider>{children}</ConfirmProvider>
    </MemoryRouter>
  </ThemeProvider>
);
