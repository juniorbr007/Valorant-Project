import React from 'react';
import './StatWidget.css';

const StatWidget = ({ icon, title, value }) => {
  return (
    <div className="stat-widget">
      <div className="stat-widget-icon">{icon}</div>
      <div className="stat-widget-info">
        <h4>{title}</h4>
        <p>{value}</p>
      </div>
    </div>
  );
};

export default StatWidget;