import { BrowserRouter, Routes, Route } from "react-router";

import { PublicRoute, ProtectedRoute, AdminRoute } from '.';

import { MainLayout } from "@widgets/layouts";

import { SignInPage } from "@pages/sign-in";
import { Dashboard } from "@pages/dashboard";
import {
  ClientManagementPage, StackPage, StackDetailPage,
  ContractPage, ContractRegisterPage, ContractDetailPage,
  PollutantPage,
} from "@pages/client";
import { AdminMemberPage } from "@pages/admin";
import { EquipmentPage } from "@pages/equipment";
import { StaffPage } from "@pages/staff";
import { SchedulePage, ScheduleRegisterPage, ScheduleDetailPage } from "@pages/schedule";

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
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/schedule/register" element={<ScheduleRegisterPage />} />
        <Route path="/schedule/:scheduleId" element={<ScheduleDetailPage />} />

        <Route
          path="/admin/members"
          element={
            <AdminRoute>
              <AdminMemberPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  </BrowserRouter>
);