import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import {
  LayoutDashboard,
  Leaf,
  Users,
  ShieldCheck,
  Trophy,
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
  { to: '/gamification', icon: Trophy, label: 'Gamification', devOwner: 'B' },
  { to: '/governance', icon: ShieldCheck, label: 'Governance', devOwner: 'C' },
  { to: '/reports', icon: FileText, label: 'Reports', devOwner: 'D' },
  { to: '/admin', icon: ShieldCheck, label: 'Admin Console', devOwner: 'A', adminOnly: true },
  { to: '/settings', icon: Settings, label: 'Settings', devOwner: 'D', adminOnly: true },
];

const moduleColors = {
  D: 'text-[#2EE08A]',
  A: 'text-[#2EE08A]',
  B: 'text-[#4EA8DE]',
  C: 'text-[#C9A24B]',
};

const moduleActiveStyles = {
  D: 'bg-white/10 text-white border-l-4 border-[#2EE08A] shadow-[0_0_12px_rgba(46,224,138,0.15)]',
  A: 'bg-white/10 text-white border-l-4 border-[#2EE08A] shadow-[0_0_12px_rgba(46,224,138,0.15)]',
  B: 'bg-white/10 text-white border-l-4 border-[#4EA8DE] shadow-[0_0_12px_rgba(78,168,222,0.15)]',
  C: 'bg-white/10 text-white border-l-4 border-[#C9A24B] shadow-[0_0_12px_rgba(201,162,75,0.15)]',
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
      className={`flex flex-col bg-[#0B1D14] text-gray-200 transition-all duration-300 relative ${
        collapsed ? 'w-16' : 'w-60'
      } h-full border-r border-white/5 shadow-2xl z-30`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/5 relative">
        {!collapsed ? (
          <div className="flex items-center gap-2 pl-1 animate-fade-in">
            <img src="/logo-named-white.svg" className="h-8 w-auto" alt="EcoSphere Logo" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full animate-fade-in">
            <img src="/favicon.svg" className="h-8 w-auto filter brightness-110" alt="EcoSphere Logo" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-all text-gray-400 hover:text-white active:scale-95"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute -right-3 top-7 bg-[#0b1d14] border border-white/10 rounded-full p-1 text-gray-400 hover:text-white shadow-md hover:scale-110 active:scale-95 transition-all z-40"
            title="Expand Sidebar"
          >
            <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* User info card */}
      {!collapsed && user && (
        <div className="mx-4 mt-5 mb-2 p-3 rounded-xl bg-white/[0.03] shadow-inner flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1F5C4D]/25 flex items-center justify-center text-[#2EE08A] text-xs font-black shadow-sm flex-shrink-0">
              {user.username ? user.username[0].toUpperCase() : 'U'}
            </div>
            <div className="text-xs font-bold text-white truncate bg-white/5 px-2.5 py-1 rounded-lg">
              {user.name || user.username || user.email}
            </div>
          </div>
          <span className="text-[9px] px-2.5 py-1 rounded-full bg-green-950 text-[#2EE08A] font-bold border border-green-900/30 uppercase flex-shrink-0">
            {user.role}
          </span>
        </div>
      )}

      {/* Navigation menu */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map(({ to, icon: Icon, label, devOwner, adminOnly }) => {
          if (adminOnly && user?.role !== 'Admin') return null;
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? moduleActiveStyles[devOwner]
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0 transition-transform group-hover:scale-110 duration-200" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Sign Out */}
      <div className="p-3 border-t border-white/5 bg-black/10">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:bg-red-950/40 hover:text-red-400 transition-all duration-200 active:scale-[0.98]"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
