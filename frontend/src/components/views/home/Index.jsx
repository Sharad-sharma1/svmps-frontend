import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="cards-grid">
        <Link to="/area" className="card">
          <h3 className="card-title">Area</h3>
          <p className="card-desc">Manage and add new areas.</p>
        </Link>
        <Link to="/village" className="card">
          <h3 className="card-title">Village</h3>
          <p className="card-desc">Manage and add villages.</p>
        </Link>
        <Link to="/user" className="card">
          <h3 className="card-title">User</h3>
          <p className="card-desc">Manage and add users.</p>
        </Link>
        <Link to="/showuser" className="card">
          <h3 className="card-title">Show User</h3>
          <p className="card-desc">You can view and filter users.</p>
        </Link>
        <Link to="/printuser" className="card">
          <h3 className="card-title">Receipt</h3>
          <p className="card-desc">Coming soon...</p>
        </Link>
        {/* You can add up to 4 more cards here later */}
      </div>
    </div>
  );
};

export default Home;
