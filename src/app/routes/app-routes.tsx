import { BrowserRouter, Routes, Route } from "react-router";

import { PublicRoute } from '.';

import { SignInPage } from "@pages/sign-in";
import { Dashboard } from "@pages/dashboard";

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <SignInPage />
        </PublicRoute>
        } />

      <Route>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  </BrowserRouter>
);