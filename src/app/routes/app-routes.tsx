import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router";

import { PublicRoute } from "./public-route";
import { ProtectedRoute } from "./protected-route";
import { AdminRoute } from "./admin-route";
import { PlatformRoute } from "./platform-route";

import { MainLayout, PlatformLayout } from "@widgets/layouts";

import { SignInPage } from "@pages/sign-in";
import { Dashboard } from "@pages/dashboard";
import {
  ClientManagementPage, StackPage, StackDetailPage,
  ContractPage, ContractRegisterPage, ContractDetailPage,
  PollutantPage,
} from "@pages/client";
import { AdminMemberPage, AdminDocumentPage } from "@pages/admin";
import { PlatformTenantPage, PlatformPollutantCatalogPage } from "@pages/platform";
import { EquipmentPage } from "@pages/equipment";
import { StaffPage } from "@pages/staff";
import {
  SchedulePage, ScheduleRegisterPage, ScheduleDetailPage,
  CanceledSchedulePage,
} from "@pages/schedule";

/**
 * 데이터 라우터로 구성한다 (`<BrowserRouter><Routes>` 조합이 아니다).
 * `useBlocker` 가 데이터 라우터에서만 동작하기 때문이다 — 측정 데이터 입력 중
 * 뒤로가기/이탈을 붙잡는 `useUnsavedChangesGuard` 가 이를 쓴다.
 * 라우트 정의(JSX)와 훅 사용법은 이전과 동일하다.
 */
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
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
        {/* :scheduleId 보다 먼저 둬야 "canceled"가 id로 잡히지 않는다 */}
        <Route path="/schedule/canceled" element={<CanceledSchedulePage />} />
        <Route path="/schedule/:scheduleId" element={<ScheduleDetailPage />} />

        <Route
          path="/admin/members"
          element={
            <AdminRoute>
              <AdminMemberPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <AdminRoute>
              <AdminDocumentPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* 플랫폼 운영자 콘솔 (PLATFORM_ADMIN 전용) — tenant 앱과 분리된 레이아웃 */}
      <Route
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <PlatformLayout />
            </PlatformRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/platform/tenants" element={<PlatformTenantPage />} />
        <Route path="/platform/pollutant-catalog" element={<PlatformPollutantCatalogPage />} />
      </Route>
    </>,
  ),
);

export const AppRoutes = () => <RouterProvider router={router} />;