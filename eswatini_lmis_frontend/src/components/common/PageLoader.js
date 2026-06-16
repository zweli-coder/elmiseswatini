import React from 'react';
import './PageLoader.css';

const PageLoader = () => {
  return (
    <div className="page-loader-overlay">
      <div className="page-loader-spinner">
        <span className="page-loader-ring ring-1" />
        <span className="page-loader-ring ring-2" />
        <span className="page-loader-ring ring-3" />
      </div>
      <p className="page-loader-text">Loading...</p>
    </div>
  );
};

export default PageLoader;