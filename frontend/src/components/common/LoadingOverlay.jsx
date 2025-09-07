import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ isVisible, message = "Loading...", isError = false, onRetry = null }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-overlay-backdrop"></div>
      <div className="loading-overlay-content">
        {!isError ? (
          <>
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <p className="loading-message">{message}</p>
            <div className="loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </>
        ) : (
          <>
            <div className="error-icon">⚠️</div>
            <p className="error-message">{message}</p>
            {onRetry && (
              <button className="retry-button" onClick={onRetry}>
                Try Again
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
