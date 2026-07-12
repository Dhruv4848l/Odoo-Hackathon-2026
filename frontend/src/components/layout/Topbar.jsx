import React from 'react';
import { useSelector } from 'react-redux';
import { Bell, User } from 'lucide-react';

const Topbar = ({ title }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
      <h1 className="text-xl font-display font-bold text-neutral-text tracking-tight">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-brand-primary">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
            {user?.name ? user.name[0].toUpperCase() : <User size={14} />}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-neutral-text leading-none">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-400">{user?.role || ''}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
