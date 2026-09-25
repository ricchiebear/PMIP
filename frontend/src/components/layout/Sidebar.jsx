import { NavLink } from 'react-router-dom';

function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { to: '/', label: 'Home', icon: '⌂' },
    { to: '/artists', label: 'Artists', icon: '◉' },
    { to: '/tracks', label: 'Tracks', icon: '♫' },
    { to: '/releases', label: 'Releases', icon: '▣' },
    { to: '/countries', label: 'Countries', icon: '◎' },
    { to: '/intelligence', label: 'Intelligence', icon: '✦' },
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive ? 'sidebar-link active' : 'sidebar-link'
              }
              onClick={onClose}
            >
              <span className="sidebar-link-icon" aria-hidden="true">
                {item.icon}
              </span>

              <span className="sidebar-link-label">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={onClose}
        />
      )}
    </>
  );
}

export default Sidebar;