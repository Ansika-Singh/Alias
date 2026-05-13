import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <div className="glass-panel stat-card">
      <div className="stat-header">
        <h3 className="stat-title">{title}</h3>
        <div className="icon-wrapper">
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {trend && (
        <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from yesterday
        </div>
      )}
    </div>
  );
};

export default StatCard;
