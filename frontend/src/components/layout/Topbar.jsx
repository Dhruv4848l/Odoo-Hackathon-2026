import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, User, CheckCheck, Eye } from 'lucide-react';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../store/governanceSlice';

const Topbar = ({ title }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadNotificationsCount } = useSelector((state) => state.governance);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications(false));
    }
  }, [dispatch, user]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-neutral-surface/85 backdrop-blur-md border-b border-neutral-border/40 shadow-sm transition-all duration-300">
      <h1 className="text-xl font-display font-bold text-neutral-text tracking-tight">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        {/* Notification bell & dropdown container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 rounded-full hover:bg-neutral-bg transition-all duration-200 text-neutral-textMuted hover:text-brand-primary active:scale-95"
          >
            <Bell size={18} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-alert text-[10px] font-bold text-white shadow-md animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-neutral-surface border border-neutral-border/60 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-bg/50 border-b border-neutral-border/40">
                <span className="font-semibold text-sm text-neutral-text font-display">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-brand-primary font-bold hover:underline flex items-center gap-1 hover:text-brand-primary/80 transition-colors"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-neutral-border/30 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-10 text-neutral-textMuted text-xs font-medium">
                    No new alerts
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.read && handleMarkRead(n._id)}
                      className={`px-4 py-3 text-left transition-colors cursor-pointer flex gap-3
                        ${n.read ? 'bg-neutral-surface hover:bg-neutral-bg/30' : 'bg-green-50/20 hover:bg-green-50/40'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-xs font-bold ${n.read ? 'text-neutral-textMuted' : 'text-[#1F5C4D]'}`}>
                            {n.type || 'Alert'}
                          </span>
                          <span className="text-[10px] text-neutral-textMuted font-medium">
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${n.read ? 'text-neutral-textMuted' : 'text-neutral-text font-semibold'}`}>
                          {n.message}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-[#2EE08A] rounded-full shadow-[0_0_8px_rgba(46,224,138,0.8)]" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-neutral-border/50">
          <div className="w-9 h-9 rounded-full bg-brand-primary border-2 border-brand-primary/20 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {user?.username ? user.username[0].toUpperCase() : <User size={15} />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-neutral-text leading-tight">
              {user?.username || 'User'}
            </p>
            <p className="text-[10px] font-bold text-neutral-textMuted uppercase tracking-wider mt-0.5">{user?.role || ''}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
