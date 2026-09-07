import React from "react";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient } from "@shared/api";
import { Toaster } from "@shared/ui/toasts";
import { ConfirmProvider } from "@shared/ui/dialogs";
import { AuthProvider } from "@app/providers";

/**
 * provider 순서에 의존성이 있다 —
 * `QueryClientProvider` 가 `AuthProvider` 보다 바깥이어야 인증 흐름에서도 쿼리를 쓸 수 있다.
 */
export const AppProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem={false}
    disableTransitionOnChange
  >
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfirmProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ConfirmProvider>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </ThemeProvider>
);
