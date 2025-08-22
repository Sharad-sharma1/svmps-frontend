import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URLS } from '../../../utils/fetchurl';
import './Home.css';

const Home = () => {
  const [stats, setStats] = useState({
    total: 0,
    all: 0,
    nrs: 0,
    commitee: 0,
    siddhpur: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(API_URLS.getUserStats());
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user statistics:', error);
    }
  };

  return (
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
          <h3 className="card-title">Create User</h3>
          <p className="card-desc">Create New User</p>
        </Link>
        <Link to="/showuser" className="card">
          <h3 className="card-title">Show User</h3>
          <p className="card-desc">Manage and Download Users</p>
        </Link>
        <Link to="/printuser" className="card">
          <h3 className="card-title">Receipt</h3>
          <p className="card-desc">Coming soon...</p>
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
  );
};

export default Home;
