import React from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@app/providers";

export const AppProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    {children}
    <Toaster position="top-right" richColors />
  </AuthProvider>
);
