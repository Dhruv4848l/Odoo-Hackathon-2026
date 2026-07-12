import React from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from '../features/auth/LoginPage';
import DepartmentCategoryManager from '../features/admin/DepartmentCategoryManager';

// Dev D screens
import OrgDashboard from '../features/reports/OrgDashboard';
import FixedReports from '../features/reports/FixedReports';
import CustomReportBuilder from '../features/reports/CustomReportBuilder';
import SettingsScreen from '../features/admin/SettingsScreen';
import AppLayout from '../components/layout/AppLayout';

const EnvironmentalDashboard = () => (
  <AppLayout title="Environmental">
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center text-gray-500">
      🔋 Environmental Dashboard — Dev A module coming soon
    </div>
  </AppLayout>
);

const SocialDashboard = () => (
  <AppLayout title="Social & CSR">
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center text-gray-500">
      🤝 Social & CSR Dashboard — Dev B module coming soon
    </div>
  </AppLayout>
);

const GovernanceDashboard = () => (
  <AppLayout title="Governance">
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center text-gray-500">
      ⚖️ Governance & Compliance — Dev C module coming soon
    </div>
  </AppLayout>
);

// Reports sub-nav wrapper
const ReportsPage = () => {
  const tabs = [
    { to: '/reports/overview', label: 'Fixed Reports' },
    { to: '/reports/custom', label: 'Custom Builder' },
  ];
  return (
    <div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6 ml-6 mt-4">
        {tabs.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                isActive ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-neutral-text'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
      <Routes>
        <Route path="overview" element={<FixedReports />} />
        <Route path="custom" element={<CustomReportBuilder />} />
        <Route index element={<Navigate to="overview" replace />} />
      </Routes>
    </div>
  );
};

// Guard Component for Private Routes
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Dev D — Org Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <OrgDashboard />
          </PrivateRoute>
        }
      />

      {/* Dev A — Environmental */}
      <Route
        path="/environmental"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
            <EnvironmentalDashboard />
          </PrivateRoute>
        }
      />

      {/* Dev B — Social */}
      <Route
        path="/social"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
            <SocialDashboard />
          </PrivateRoute>
        }
      />

      {/* Dev C — Governance */}
      <Route
        path="/governance"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Auditor']}>
            <GovernanceDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <DepartmentCategoryManager />
          </PrivateRoute>
        }
      />

      {/* Dev D — Reports */}
      <Route
        path="/reports/*"
        element={
          <PrivateRoute>
            <ReportsPage />
          </PrivateRoute>
        }
      />

      {/* Dev D — Settings (Admin only) */}
      <Route
        path="/settings"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <SettingsScreen />
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
