import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/add-job', label: 'Add Job', icon: '➕' },
    { path: '/all-jobs', label: 'All Jobs', icon: '📋' },
    { path: '/reports', label: 'Reports', icon: '📊' }
  ];

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>Iron & Clean Pro</h1>
          </div>
          <nav className="nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="user-info">
            <span className="user-email">tonybisht</span>
            <button className="logout-btn" onClick={onLogout} title="Logout">
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;