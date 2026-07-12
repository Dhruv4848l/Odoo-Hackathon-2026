import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = ({ title, children }) => {
  return (
    <div className="flex min-h-screen bg-neutral-bg font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar title={title} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
