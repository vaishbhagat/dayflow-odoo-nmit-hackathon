import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { AppShell } from '@/components/layout/AppShell';

// Auth pages
const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));

// Employee pages
const EmployeeDashboard = lazy(() => import('@/pages/employee/Dashboard'));
const EmployeeProfile = lazy(() => import('@/pages/employee/Profile'));
const EmployeeAttendance = lazy(() => import('@/pages/employee/Attendance'));
const EmployeeLeaves = lazy(() => import('@/pages/employee/LeaveRequests'));
const EmployeePayroll = lazy(() => import('@/pages/employee/Payroll'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminEmployees = lazy(() => import('@/pages/admin/EmployeeDirectory'));
const AdminEmployeeDetail = lazy(() => import('@/pages/admin/EmployeeDetail'));
const AdminLeaves = lazy(() => import('@/pages/admin/LeaveApprovals'));
const AdminAttendance = lazy(() => import('@/pages/admin/AttendanceLogs'));
const AdminPayroll = lazy(() => import('@/pages/admin/PayrollControls'));
const AdminReports = lazy(() => import('@/pages/admin/Reports'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Employee routes */}
        <Route
          path="/employee/*"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRole="Employee">
                <AppShell>
                  <Routes>
                    <Route path="dashboard" element={<EmployeeDashboard />} />
                    <Route path="profile"   element={<EmployeeProfile />} />
                    <Route path="attendance" element={<EmployeeAttendance />} />
                    <Route path="leaves"    element={<EmployeeLeaves />} />
                    <Route path="payroll"   element={<EmployeePayroll />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AppShell>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRole="HR/Admin">
                <AppShell>
                  <Routes>
                    <Route path="dashboard"        element={<AdminDashboard />} />
                    <Route path="employees"        element={<AdminEmployees />} />
                    <Route path="employees/:id"    element={<AdminEmployeeDetail />} />
                    <Route path="leaves"           element={<AdminLeaves />} />
                    <Route path="attendance"       element={<AdminAttendance />} />
                    <Route path="payroll"          element={<AdminPayroll />} />
                    <Route path="reports"          element={<AdminReports />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AppShell>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
