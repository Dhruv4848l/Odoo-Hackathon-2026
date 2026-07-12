import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import {
  LayoutDashboard,
  Leaf,
  Users,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Org Dashboard', devOwner: 'D' },
  { to: '/environmental', icon: Leaf, label: 'Environmental', devOwner: 'A' },
  { to: '/social', icon: Users, label: 'Social & CSR', devOwner: 'B' },
  { to: '/governance', icon: ShieldCheck, label: 'Governance', devOwner: 'C' },
  { to: '/reports', icon: FileText, label: 'Reports', devOwner: 'D' },
  { to: '/settings', icon: Settings, label: 'Settings', devOwner: 'D', adminOnly: true },
];

const moduleColors = {
  D: 'text-brand-primary',
  A: 'text-module-environmental',
  B: 'text-module-social',
  C: 'text-module-governance',
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside
      className={`flex flex-col bg-neutral-text text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      } min-h-screen`}
      style={{ background: '#1a2e26' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Leaf size={22} className="text-green-400" />
            <span className="font-display font-bold text-lg tracking-tight text-white">
              EcoSphere
            </span>
          </div>
        )}
        {collapsed && <Leaf size={22} className="mx-auto text-green-400" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-white/10 transition text-gray-400 hover:text-white"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User chip */}
      {!collapsed && user && (
        <div className="mx-4 mt-4 mb-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-gray-400 leading-none mb-0.5">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">{user.name || user.email}</p>
          <span className="text-xs px-1.5 py-0.5 rounded bg-green-700/60 text-green-300 font-medium">
            {user.role}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, devOwner, adminOnly }) => {
          if (adminOnly && user?.role !== 'Admin') return null;
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-green-600/30 text-white border border-green-500/30'
                    : 'text-gray-400 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <Icon size={18} className={moduleColors[devOwner] || 'text-gray-400'} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-white/10 pt-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-900/30 hover:text-red-300 transition-all duration-150"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
