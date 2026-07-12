import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function EnvironmentalHeader() {
  const { user } = useSelector((state) => state.auth);

  const links = [
    { to: '/environmental', label: '📊 Dashboard', end: true },
    { to: '/environmental/log', label: '📝 Log Carbon Activity' },
  ];

  // Only show Emission Factors config for Admins
  if (user && user.role === 'Admin') {
    links.push(
      { to: '/environmental/factors', label: '⚗️ Emission Factors' }
    );
  }

  return (
    <div className="mb-6 border-b border-neutral-border pb-3 flex justify-between items-center">
      <div className="flex gap-2 overflow-x-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-neutral-textMuted hover:text-neutral-text hover:bg-neutral-bg'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="text-xs text-neutral-textMuted bg-neutral-bg px-2.5 py-1 rounded-full font-mono uppercase">
        Role: <strong>{user?.role || 'Guest'}</strong>
      </div>
    </div>
  );
}
