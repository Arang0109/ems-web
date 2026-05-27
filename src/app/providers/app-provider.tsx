import React from "react";
import { AuthProvider } from "@app/providers";

export const AppProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);
