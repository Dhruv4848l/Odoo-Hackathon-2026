import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Stubs/Placeholders for pages. Respective devs will build these.
const LoginPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>🌿 EcoSphere Login Page</h2>
    <p>Authentication screen (Dev A)</p>
  </div>
);

const EnvironmentalDashboard = () => (
  <div style={{ padding: '2rem' }}>
    <h2>🔋 Environmental Dashboard</h2>
    <p>Carbon transactions, emission factor configuration (Dev A)</p>
  </div>
);

const SocialDashboard = () => (
  <div style={{ padding: '2rem' }}>
    <h2>🤝 Social & CSR Dashboard</h2>
    <p>CSR Activities, challenges, gamification catalog (Dev B)</p>
  </div>
);

const GovernanceDashboard = () => (
  <div style={{ padding: '2rem' }}>
    <h2>⚖️ Governance & Compliance</h2>
    <p>Policies, acknowledgements, audits (Dev C)</p>
  </div>
);

const MainDashboard = () => (
  <div style={{ padding: '2rem' }}>
    <h2>📊 Org ESG Dashboard</h2>
    <p>General overview, combined scores and reports (Dev D)</p>
  </div>
);

// Guard Component for Private Routes
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // For testing: bypass check if no user but let's encourage auth
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Role not authorized, redirect to general dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Private Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/environmental"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
            <EnvironmentalDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/social"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
            <SocialDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/governance"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Auditor']}>
            <GovernanceDashboard />
          </PrivateRoute>
        }
      />

      {/* Redirect fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
