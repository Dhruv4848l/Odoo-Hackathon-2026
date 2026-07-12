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
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
      <h1 className="text-xl font-display font-bold text-neutral-text tracking-tight">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        {/* Notification bell & dropdown container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-brand-primary"
          >
            <Bell size={18} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm px-1">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="font-semibold text-sm text-neutral-text">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-brand-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.read && handleMarkRead(n._id)}
                      className={`px-4 py-3 text-left transition-colors cursor-pointer flex gap-3
                        ${n.read ? 'bg-white hover:bg-gray-50/50' : 'bg-green-50/40 hover:bg-green-50/80'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-xs font-bold ${n.read ? 'text-gray-500' : 'text-green-700'}`}>
                            {n.type || 'Alert'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className={`text-xs ${n.read ? 'text-gray-500' : 'text-neutral-text font-medium'}`}>
                          {n.message}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
            {user?.username ? user.username[0].toUpperCase() : <User size={14} />}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-neutral-text leading-none">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-400">{user?.role || ''}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
