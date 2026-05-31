import { BrowserRouter, Routes, Route } from "react-router";

import { PublicRoute, ProtectedRoute } from '.';

import { MainLayout } from "@widgets/layouts";

import { SignInPage } from "@pages/sign-in";
import { Dashboard } from "@pages/dashboard";
import { ClientManagementPage, ContractPage, ContractRegisterPage } from "@pages/client";

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
        <Route path="/clients" element={<ClientManagementPage />} />
        <Route path="/contracts" element={<ContractPage />} />
        <Route path="/contracts/register" element={<ContractRegisterPage />} />

      </Route>
    </Routes>
  </BrowserRouter>
);