import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URLS } from '../../../utils/fetchurl';
import { useRegularApiCall } from '../../../hooks/useApiCall';
import LoadingOverlay from '../../common/LoadingOverlay';
import './Home.css';

const Home = () => {
  const [stats, setStats] = useState({
    total: 0,
    all: 0,
    nrs: 0,
    commitee: 0,
    siddhpur: 0
  });

  const { loading, error, execute, reset } = useRegularApiCall();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      await execute(
        ({ signal }) => axios.get(API_URLS.getUser_dataStats(), { signal }),
        {
          loadingMessage: "Loading dashboard statistics...",
          onSuccess: (response) => {
            setStats(response.data);
          },
          onError: (error) => {
            console.error('Failed to fetch user statistics:', error);
          }
        }
      );
    } catch (err) {
      // Error is already handled by useApiCall hook
    }
  };

  const handleRetry = () => {
    reset();
    fetchStats();
  };

  return (
    <>
      <LoadingOverlay 
        isVisible={loading}
        message="Loading dashboard statistics..."
      />
      <LoadingOverlay 
        isVisible={error && !loading}
        message={error?.message}
        isError={true}
        onRetry={error?.canRetry ? handleRetry : null}
      />
      
      <div className="home-container">
        <div className="cards-grid">
          <Link to="/area" className="card">
            <h3 className="card-title">Area</h3>
            <p className="card-desc">Create and Delete Area</p>
          </Link>
          <Link to="/village" className="card">
            <h3 className="card-title">Village</h3>
            <p className="card-desc">Create and Delete Village</p>
          </Link>
          <Link to="/user" className="card">
            <h3 className="card-title">Create User Data</h3>
            <p className="card-desc">Create New User Data</p>
          </Link>
          <Link to="/showuser" className="card">
            <h3 className="card-title">Show User Data</h3>
            <p className="card-desc">Manage and Download User Data</p>
          </Link>
          <Link to="/receipts" className="card">
            <h3 className="card-title">Receipts</h3>
            <p className="card-desc">Create, modify and generate receipt reports</p>
          </Link>
          {/* You can add up to 4 more cards here later */}
        </div>
        
        <div className="stats-footer">
          <div className="stats-content">
            <span className="stat-item">TOTAL - {stats.total}</span>
            <span className="stat-item">ALL - {stats.all || 0}</span>
            <span className="stat-item">NRS - {stats.nrs || 0}</span>
            <span className="stat-item">COMMITEE - {stats.commitee || 0}</span>
            <span className="stat-item">SIDDHPUR - {stats.siddhpur || 0}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
