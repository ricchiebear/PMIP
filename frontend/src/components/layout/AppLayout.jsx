import Navbar from './Navbar';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />

      <div className="app-content">
        {children}
      </div>
    </div>
  );
}

export default AppLayout;