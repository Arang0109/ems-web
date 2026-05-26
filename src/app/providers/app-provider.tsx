import React from "react";
import { ThemeProvider } from "@material-tailwind/react";
import { AuthProvider } from "@app/providers";

export const AppProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </ThemeProvider>
);