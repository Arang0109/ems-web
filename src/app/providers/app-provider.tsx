import React from "react";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@shared/ui/toasts";
import { ConfirmProvider } from "@shared/ui/dialogs";
import { AuthProvider } from "@app/providers";

export const AppProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem={false}
    disableTransitionOnChange
  >
    <AuthProvider>
      <ConfirmProvider>
        {children}
        <Toaster position="top-right" richColors />
      </ConfirmProvider>
    </AuthProvider>
  </ThemeProvider>
);
