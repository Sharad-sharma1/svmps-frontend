import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Index.css';

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    closeSidebar();
    logout();
  };

  return (
    <>
      <header className="navbar-container">
        <div className="navbar-left">
          <img
            src="Hamburger.svg"
            alt="Menu"
            className="hamburger-icon"
            onClick={toggleSidebar}
          />
        </div>
        <div className="scrolling-banner">
        <div className="scrolling-text">
          Shree Vishwakarma Dhandhar Mewada Suthar Samaj Samuh Lagna Trust Siddhpur
        </div>
      </div>

      </header>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={closeSidebar}>×</button>
        <Link to="/home" className="sidebar-link" onClick={closeSidebar}>Home</Link>
        <Link to="/area" className="sidebar-link" onClick={closeSidebar}>Area</Link>
        <Link to="/village" className="sidebar-link" onClick={closeSidebar}>Village</Link>
        <Link to="/user" className="sidebar-link" onClick={closeSidebar}>Create User Data</Link>
        <Link to="/showuser" className="sidebar-link" onClick={closeSidebar}>Show User Data</Link>
        <Link to="/receipts" className="sidebar-link" onClick={closeSidebar}>Receipts</Link>
        <button className="login-button" onClick={handleLogout}>
          Log Out {user?.username ? `(${user.username})` : ''}
        </button>
      </div>
      
      

      {/* Optional overlay */}
      {sidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}
    </>
  );
};

export default Navbar;
