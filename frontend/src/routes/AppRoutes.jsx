import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CSRActivityList from '../features/social/CSRActivityList';
import ChallengeBoard from '../features/social/ChallengeBoard';
import RewardCatalog from '../features/social/RewardCatalog';
import Leaderboard from '../features/social/Leaderboard';
import ApprovalQueue from '../features/social/ApprovalQueue';

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

const SocialDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('activities');

  const tabs = [
    { id: 'activities', label: '🤝 CSR Activities', component: <CSRActivityList /> },
    { id: 'challenges', label: '🏆 Challenges', component: <ChallengeBoard /> },
    { id: 'rewards', label: '🎁 Reward Catalog', component: <RewardCatalog /> },
    { id: 'leaderboard', label: '📈 Leaderboard', component: <Leaderboard /> },
  ];

  // Only Admin or Manager can access the Approval Queue
  if (user && ['Admin', 'Manager'].includes(user.role)) {
    tabs.push({ id: 'approvals', label: '📋 Approval Queue', component: <ApprovalQueue /> });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                  🌿 <span>EcoSphere</span>
                </span>
              </div>
              <nav className="ml-6 flex space-x-4 items-center">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-500">{user.role} - Dept: {user.department ? 'Assigned' : 'None'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {tabs.find((t) => t.id === activeTab)?.component}
        </div>
      </main>
    </div>
  );
};

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

