import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = ({ title, children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-bg font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Topbar title={title} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
