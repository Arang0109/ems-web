import { BrowserRouter, Routes, Route } from "react-router";

import { PublicRoute, ProtectedRoute } from '.';

import { MainLayout } from "@widgets/layouts";

import { SignInPage } from "@pages/sign-in";
import { Dashboard } from "@pages/dashboard";
import { Companies } from "@pages/companies";

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <SignInPage />
        </PublicRoute>
        } />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/companies" element={<Companies />} />
      </Route>
    </Routes>
  </BrowserRouter>
);