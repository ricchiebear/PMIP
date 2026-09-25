import { useState } from 'react';

import Navbar from './Navbar';
import Sidebar from './Sidebar';

function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function openSidebar() {
    setIsSidebarOpen(true);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className="app-layout">
      <Navbar onMenuClick={openSidebar} />

      <div className="app-shell">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;