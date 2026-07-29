import React from "react";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@app/providers";

export const AppProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem={false}
    disableTransitionOnChange
  >
    <AuthProvider>
      {children}
      <Toaster position="top-right" richColors />
    </AuthProvider>
  </ThemeProvider>
);
