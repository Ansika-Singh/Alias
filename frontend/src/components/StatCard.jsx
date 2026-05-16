import React from 'react';
import { useTranslation } from 'react-i18next';
import './StatCard.css';

const StatCard = ({ title, value, icon: Icon, trend }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const fromYesterday = {
    en: 'from yesterday',
    hi: 'कल से',
    kn: 'ನಿನ್ನೆಯಿಂದ',
  }[lang] || 'from yesterday';

  return (
    <div className="glass-panel stat-card">
      <div className="stat-header">
        <h3 className="stat-title">{title}</h3>
        <div className="icon-wrapper">
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {trend !== undefined && trend !== 0 && (
        <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% {fromYesterday}
        </div>
      )}
    </div>
  );
};

export default StatCard;
