import { useTheme } from '../context/ThemeContext';
import { HiOutlineSearch } from 'react-icons/hi';
import { BsSun, BsMoonStars } from 'react-icons/bs';
import './Navbar.css';

const Navbar = ({ searchQuery, onSearchChange }) => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <div className="navbar-logo">
            <div className="nav-logo-icon">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="2" width="24" height="28" rx="3" stroke="currentColor" strokeWidth="2.5"/>
                <path d="M10 10h12M10 16h12M10 22h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="nav-title">PrivateNotes</span>
          </div>
        </div>

        <div className="navbar-center">
          <div className="search-container">
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => onSearchChange('')}>
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="navbar-right">
          <button className="nav-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {darkMode ? <BsSun size={18} /> : <BsMoonStars size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
