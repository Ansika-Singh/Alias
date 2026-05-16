import React from 'react';
import { useTranslation } from 'react-i18next';

const HeatmapCalendar = ({ data = [] }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const dayLabels = {
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    hi: ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'],
    kn: ['ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು', 'ಶುಕ್ರ', 'ಶನಿ', 'ರವಿ'],
  };

  const title = { en: 'Attendance Density', hi: 'उपस्थिति घनत्व', kn: 'ಹಾಜರಾತಿ ಸಾಂದ್ರತೆ' };
  const labels = dayLabels[lang] || dayLabels.en;

  // Generate last 7 days of mock data if none provided
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const found = data.find(x => x.date === d.toISOString().split('T')[0]);
    return {
      day: labels[i],
      value: found ? Math.min(100, (found.count / 5) * 100) : Math.floor(Math.random() * 40 + 55),
    };
  });

  const maxVal = Math.max(...weekData.map(d => d.value), 1);

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        {title[lang] || title.en}
      </h4>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: '140px' }}>
        {weekData.map((d, i) => {
          const pct = (d.value / maxVal) * 100;
          const color = d.value >= 85
            ? '#10b981'
            : d.value >= 70
            ? '#ec4899'
            : '#f59e0b';

          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', height: '100%', justifyContent: 'flex-end' }}>
              {/* Value label */}
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color, opacity: 0.9 }}>
                {Math.round(d.value)}%
              </span>
              {/* Bar */}
              <div style={{
                width: '100%',
                height: `${pct}%`,
                minHeight: '4px',
                background: `linear-gradient(to top, ${color}, ${color}88)`,
                borderRadius: '6px 6px 3px 3px',
                transition: 'height 0.6s ease',
                boxShadow: `0 2px 8px ${color}44`,
              }} />
              {/* Day label */}
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {d.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.2rem', marginTop: '1rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#10b981', display: 'inline-block' }} />
          {lang === 'hi' ? '≥85% अच्छा' : lang === 'kn' ? '≥85% ಉತ್ತಮ' : '≥85% Good'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#ec4899', display: 'inline-block' }} />
          {lang === 'hi' ? '70–84% ठीक' : lang === 'kn' ? '70–84% ಸರಿ' : '70–84% Fair'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#f59e0b', display: 'inline-block' }} />
          {lang === 'hi' ? '<70% कम' : lang === 'kn' ? '<70% ಕಡಿಮೆ' : '<70% Low'}
        </span>
      </div>
    </div>
  );
};

export default HeatmapCalendar;
