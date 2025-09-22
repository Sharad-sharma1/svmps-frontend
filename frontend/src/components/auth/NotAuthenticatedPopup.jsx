import React from 'react';
import './NotAuthenticatedPopup.css';

const NotAuthenticatedPopup = () => {
  const handleLoginClick = () => {
    // Force navigation to login page and clear any cached data
    // Use the correct base path for GitHub Pages deployment
    window.location.href = '/svmps-frontend/';
  };

  return (
    <div className="auth-popup-overlay">
      <div className="auth-popup-container">
        <div className="auth-popup-content">
          <div className="auth-popup-icon">🔒</div>
          <h2 className="auth-popup-title">Access Denied</h2>
          <p className="auth-popup-message">
            You are not authenticated. Please login to access this page.
          </p>
          <div className="auth-popup-buttons">
            <button 
              className="auth-popup-login-btn"
              onClick={handleLoginClick}
            >
              Login Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotAuthenticatedPopup;
