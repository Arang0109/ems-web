import { BrowserRouter, Routes, Route } from "react-router";

import { PublicRoute, ProtectedRoute } from '.';

import { MainLayout } from "@widgets/layouts";

import { SignInPage } from "@pages/sign-in";
import { Dashboard } from "@pages/dashboard";
import {
  ClientManagementPage, StackPage, StackDetailPage,
  ContractPage, ContractRegisterPage, ContractDetailPage,
  PollutantPage,
} from "@pages/client";

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
        <Route path="/contracts/:contractId" element={<ContractDetailPage />} />
        <Route path="/stacks" element={<StackPage />} />
        <Route path="/stacks/:stackId" element={<StackDetailPage />} />
        <Route path="/pollutants" element={<PollutantPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);