import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: '🏠' },
  { path: '/environmental', label: 'Environment', icon: '🌿' },
  { path: '/environmental/log', label: 'Log Activity', icon: '📝', indent: true },
  { path: '/environmental/factors', label: 'Emission Factors', icon: '⚗️', indent: true, adminOnly: true },
  { path: '/social', label: 'Social & CSR', icon: '🤝' },
  { path: '/governance', label: 'Governance', icon: '⚖️' },
  { path: '/admin', label: 'Admin Console', icon: '🛡️', adminOnly: true },
];

export default function AppShell({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const visibleNav = navItems.filter(item => !item.adminOnly || user?.role === 'Admin');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F5F0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '64px',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1F5C4D 0%, #174739 100%)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        boxShadow: '2px 0 16px rgba(0,0,0,0.15)',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {/* Logo / Brand */}
        <div style={{
          padding: sidebarOpen ? '24px 20px 16px' : '24px 12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '22px', flexShrink: 0 }}>🌱</span>
          {sidebarOpen && (
            <div>
              <div style={{ color: '#fff', fontWeight: '800', fontSize: '17px', letterSpacing: '-0.3px', fontFamily: 'Poppins, system-ui, sans-serif' }}>EcoSphere</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', fontWeight: '500' }}>ESG Platform</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              marginLeft: 'auto',
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              width: '26px', height: '26px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', flexShrink: 0,
            }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {visibleNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: sidebarOpen ? '9px 12px' : '9px 0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                marginLeft: sidebarOpen && item.indent ? '12px' : '0',
                marginBottom: '2px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: item.indent ? '13px' : '14px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: item.indent ? '14px' : '16px', flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: sidebarOpen ? '14px 16px' : '14px 8px',
        }}>
          {sidebarOpen && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username || 'User'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
              <span style={{
                display: 'inline-block', marginTop: '4px',
                padding: '1px 8px', borderRadius: '99px',
                background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)',
                fontSize: '10px', fontWeight: '600',
              }}>
                {user?.role}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '8px',
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
          >
            <span>🚪</span>
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
