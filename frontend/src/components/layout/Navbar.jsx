import { NavLink } from 'react-router-dom';

function Navbar({ onMenuClick }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-brand-icon" aria-hidden="true">
            ◀▮▶
          </span>

          <span className="navbar-brand-text">
            <span className="navbar-brand-name">PMIP</span>
            <span className="navbar-brand-subtitle">
              Public Music Intelligence Platform
            </span>
          </span>
        </NavLink>

        <div className="navbar-actions">
          <button
            type="button"
            className="navbar-search-button"
            aria-label="Search PMIP"
            title="Search PMIP"
          >
            <span className="navbar-action-icon" aria-hidden="true">
              ⌕
            </span>
          </button>

          <button
            type="button"
            className="navbar-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <span className="navbar-action-icon" aria-hidden="true">
              ☰
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;