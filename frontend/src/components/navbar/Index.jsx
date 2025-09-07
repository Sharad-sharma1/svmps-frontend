import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Index.css';

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
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
        <Link to="/user" className="sidebar-link" onClick={closeSidebar}>User</Link>
        <Link to="/showuser" className="sidebar-link" onClick={closeSidebar}>Show User</Link>
        <Link to="/receipts" className="sidebar-link" onClick={closeSidebar}>Receipts</Link>
        <Link to="/" className="login-button">Log Out</Link>
      </div>
      
      

      {/* Optional overlay */}
      {sidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}
    </>
  );
};

export default Navbar;
