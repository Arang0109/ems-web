import { BrowserRouter, Routes, Route } from "react-router";

import { PublicRoute } from '.';

import { SignInPage } from "@/pages/sign-in";

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <SignInPage />
        </PublicRoute>
        } />
    </Routes>
  </BrowserRouter>
);