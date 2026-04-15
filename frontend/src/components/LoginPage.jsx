import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { BsSun, BsMoonStars } from 'react-icons/bs';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (result.success) {
        toast.success('Welcome back!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button className="theme-toggle-login" onClick={toggleTheme} aria-label="Toggle theme">
        {darkMode ? <BsSun size={18} /> : <BsMoonStars size={18} />}
      </button>

      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="2" width="24" height="28" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 10h12M10 16h12M10 22h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h1>PrivateNotes</h1>
          </div>
          <p className="login-subtitle">Your secure personal file vault</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <HiOutlineUser className="input-icon" />
              <input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <HiOutlineLockClosed className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loader"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="login-footer">🔒 Private & Secure — Single user access only</p>
      </div>

      <div className="login-bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
    </div>
  );
};

export default LoginPage;
