import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          PMIP
        </NavLink>

        <nav className="navbar-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/artists">Artists</NavLink>
          <NavLink to="/tracks">Tracks</NavLink>
          <NavLink to="/releases">Releases</NavLink>
          <NavLink to="/countries">Countries</NavLink>
          <NavLink to="/intelligence">Intelligence</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;