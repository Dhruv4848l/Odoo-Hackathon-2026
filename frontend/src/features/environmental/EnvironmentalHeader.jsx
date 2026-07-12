import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BarChart3, Edit3, Box, ShieldAlert } from 'lucide-react';

export default function EnvironmentalHeader() {
  const { user } = useSelector((state) => state.auth);

  const links = [
    { to: '/environmental', label: 'Dashboard', icon: BarChart3, end: true },
    { to: '/environmental/log', label: 'Log Carbon Activity', icon: Edit3 },
    { to: '/environmental/products', label: 'Product ESG Profiles', icon: Box },
  ];

  // Only show Emission Factors config for Admins
  if (user && user.role === 'Admin') {
    links.push(
      { to: '/environmental/factors', label: 'Emission Factors', icon: ShieldAlert }
    );
  }

  return (
    <div className="mb-6 border-b border-neutral-border pb-3 flex justify-between items-center">
      <div className="flex gap-2 overflow-x-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10'
                    : 'text-neutral-textMuted hover:text-neutral-text hover:bg-neutral-bg'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
      <div className="text-[10px] text-neutral-textMuted bg-neutral-bg px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-neutral-border/30">
        Role: <strong className="text-brand-primary font-black ml-1">{user?.role || 'Guest'}</strong>
      </div>
    </div>
  );
}
