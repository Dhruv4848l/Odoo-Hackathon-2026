import React, { useState } from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FileText, Sliders, HeartHandshake, Users, BarChart3, Trophy, Award, Gift, TrendingUp, Activity } from 'lucide-react';

// Layout
import AppLayout from '../components/layout/AppLayout';

// Auth
import LoginPage from '../features/auth/LoginPage';

// Dashboard / Overview (Dev A & D)
import MainDashboard from '../features/dashboard/MainDashboard';
import OrgDashboard from '../features/reports/OrgDashboard';

// Environmental (Dev A)
import EnvironmentalDashboard from '../features/environmental/EnvironmentalDashboard';
import CarbonEntryForm from '../features/environmental/CarbonEntryForm';
import EmissionFactorConfig from '../features/environmental/EmissionFactorConfig';
import ProductESGProfileBoard from '../features/environmental/ProductESGProfileBoard';

// Social & CSR (Dev B)
import CSRActivityList from '../features/social/CSRActivityList';
import ChallengeBoard from '../features/social/ChallengeBoard';
import RewardCatalog from '../features/social/RewardCatalog';
import Leaderboard from '../features/social/Leaderboard';
import ApprovalQueue from '../features/social/ApprovalQueue';
import BadgeGallery from '../features/social/BadgeGallery';
import ChallengeParticipationBoard from '../features/social/ChallengeParticipationBoard';
import EmployeeParticipationTracker from '../features/social/EmployeeParticipationTracker';
import DiversityDashboard from '../features/social/DiversityDashboard';

// Governance (Dev C)
import PolicyList from '../features/governance/PolicyList';
import AcknowledgementTracker from '../features/governance/AcknowledgementTracker';
import ComplianceKanban from '../features/governance/ComplianceKanban';
import AuditManager from '../features/governance/AuditManager';

// Admin / Settings (Dev A & D)
import DepartmentCategoryManager from '../features/admin/DepartmentCategoryManager';
import SettingsScreen from '../features/admin/SettingsScreen';

// Reports (Dev D)
import FixedReports from '../features/reports/FixedReports';
import CustomReportBuilder from '../features/reports/CustomReportBuilder';

// ─── Social Dashboard (Dev B tabbed container wrapper) ────────────────────────

const SocialDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('activities');

  const tabs = [
    { id: 'activities', label: 'CSR Activities', icon: HeartHandshake, component: <CSRActivityList /> },
    { id: 'participation', label: 'Employee Participation', icon: Activity, component: <EmployeeParticipationTracker /> },
    { id: 'diversity', label: 'Diversity Dashboard', icon: BarChart3, component: <DiversityDashboard /> },
  ];

  return (
    <AppLayout title="Social & CSR">
      <div className="flex flex-col gap-6">
        {/* Tab Selector */}
        <div className="bg-neutral-surface rounded-2xl p-1 border border-neutral-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10'
                    : 'text-neutral-textMuted hover:text-neutral-text hover:bg-neutral-bg/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {tabs.find((t) => t.id === activeTab)?.component}
        </div>
      </div>
    </AppLayout>
  );
};

const GamificationDashboard = () => {
  const [activeTab, setActiveTab] = useState('challenges');

  const tabs = [
    { id: 'challenges', label: 'Challenges', icon: Trophy, component: <ChallengeBoard /> },
    { id: 'participation', label: 'Challenge Participation', icon: Activity, component: <ChallengeParticipationBoard /> },
    { id: 'badges', label: 'Badge Gallery', icon: Award, component: <BadgeGallery /> },
    { id: 'rewards', label: 'Rewards Catalog', icon: Gift, component: <RewardCatalog /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp, component: <Leaderboard /> },
  ];

  return (
    <AppLayout title="Gamification">
      <div className="flex flex-col gap-6">
        {/* Tab Selector */}
        <div className="bg-neutral-surface rounded-2xl p-1 border border-neutral-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10'
                    : 'text-neutral-textMuted hover:text-neutral-text hover:bg-neutral-bg/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {tabs.find((t) => t.id === activeTab)?.component}
        </div>
      </div>
    </AppLayout>
  );
};

// ─── Reports Page wrapper with internal navigation tabs ────────────────────────

const ReportsPage = () => {
  const tabs = [
    { to: '/reports/overview', label: 'Fixed Reports', icon: FileText },
    { to: '/reports/custom', label: 'Custom Builder', icon: Sliders },
  ];
  return (
    <AppLayout title="Reports & Analytics">
      <div>
        <div className="flex gap-1.5 bg-neutral-surface p-1 rounded-2xl border border-neutral-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] w-fit mb-6">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10'
                    : 'text-neutral-textMuted hover:text-neutral-text hover:bg-neutral-bg/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
        <Routes>
          <Route path="overview" element={<FixedReports />} />
          <Route path="custom" element={<CustomReportBuilder />} />
          <Route index element={<Navigate to="overview" replace />} />
        </Routes>
      </div>
    </AppLayout>
  );
};

// ─── Route guard for private/authenticated sessions ───────────────────────────

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

// Smart landing redirect: login if unauthenticated, dashboard if authenticated
const RootRedirect = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

// ─── Main App Routes Configuration ────────────────────────────────────────────

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Dev D — Org Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <OrgDashboard />
          </PrivateRoute>
        }
      />

      {/* Dev A — Environmental Dashboard & Logger */}
      <Route
        path="/environmental"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
            <AppLayout title="Environmental Dashboard">
              <EnvironmentalDashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/environmental/log"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
            <AppLayout title="Log Carbon Activity">
              <CarbonEntryForm />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/environmental/products"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
            <AppLayout title="Product ESG Profiles">
              <ProductESGProfileBoard />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/environmental/factors"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AppLayout title="Emission Factors">
              <EmissionFactorConfig />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Dev B — Social & CSR (Tabbed view) */}
      <Route
        path="/social"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
            <SocialDashboard />
          </PrivateRoute>
        }
      />

      {/* Dev B — Gamification (Tabbed view) */}
      <Route
        path="/gamification"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
            <GamificationDashboard />
          </PrivateRoute>
        }
      />

      {/* Dev C — Governance & Compliance */}
      <Route
        path="/governance/policies"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Employee', 'Auditor']}>
            <AppLayout title="Compliance Policies">
              <PolicyList />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/governance/tracker"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Auditor']}>
            <AppLayout title="Acknowledgement Tracker">
              <AcknowledgementTracker />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/governance/audits"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Auditor']}>
            <AppLayout title="Audits Dashboard">
              <AuditManager />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/governance/kanban"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Manager', 'Auditor']}>
            <AppLayout title="Compliance Kanban">
              <ComplianceKanban />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/governance"
        element={<Navigate to="/governance/policies" replace />}
      />

      {/* Dev D — Reports and Analytics (custom sub-router) */}
      <Route
        path="/reports/*"
        element={
          <PrivateRoute>
            <ReportsPage />
          </PrivateRoute>
        }
      />

      {/* Dev D — Settings Screen */}
      <Route
        path="/settings"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AppLayout title="Settings">
              <SettingsScreen />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Dev A — Department & Category Admin Management */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AppLayout title="Admin Management">
              <DepartmentCategoryManager />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
