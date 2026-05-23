import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  Camera, 
  Languages, 
  QrCode, 
  Shield, 
  LogOut,
  Crown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => {
  const { i18n, t } = useTranslation();
  const linkClass = ({ isActive }) => isActive ? "nav-item active" : "nav-item";
  const userRole = localStorage.getItem('userRole') || 'teacher';
  const userName = localStorage.getItem('userName') || 'Admin';

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
  };

  const isPrincipal = userRole === 'principal';
  const isTeacherOrAbove = userRole === 'teacher' || userRole === 'principal';

  return (
    <aside className="sidebar glass-panel">
      <div className="logo-container">
        <h1 className="text-gradient">ALIAS</h1>
        <p className="subtitle">
          {isPrincipal ? 'Principal Portal' : 'Admin Portal'}
        </p>
        {isPrincipal && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            marginTop: '0.5rem',
            padding: '0.3rem 0.6rem',
            background: 'rgba(245, 158, 11, 0.15)',
            borderRadius: '6px',
            fontSize: '0.7rem',
            color: '#f59e0b',
            fontWeight: '600'
          }}>
            <Crown size={12} />
            PRINCIPAL ACCESS
          </div>
        )}
      </div>
      
      <nav className="nav-menu">
        <NavLink to="/" end className={linkClass}>
          <LayoutDashboard size={20} />
          <span>{t('dashboard')}</span>
        </NavLink>
        <NavLink to="/students" className={linkClass}>
          <Users size={20} />
          <span>{t('students')}</span>
        </NavLink>
        <NavLink to="/timetable" className={linkClass}>
          <Calendar size={20} />
          <span>{t('timetable')}</span>
        </NavLink>
        <NavLink to="/photo-attendance" className={linkClass}>
          <Camera size={20} />
          <span>{t('attendance')}</span>
        </NavLink>
        <NavLink to="/qr-attendance" className={linkClass}>
          <QrCode size={20} />
          <span>{t('qrAttendance')}</span>
        </NavLink>
        
        {/* Principal-only routes */}
        {isPrincipal && (
          <NavLink to="/audit-log" className={linkClass}>
            <Shield size={20} />
            <span>{t('auditTrail')}</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-lang-select">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          fontSize: '0.8rem', 
          opacity: 0.7,
          marginBottom: '0.5rem'
        }}>
          <Languages size={14} />
          {t('language')}
        </div>
        <select 
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            color: 'white',
            padding: '4px',
            fontSize: '0.8rem',
            outline: 'none'
          }}
        >
          <option value="en" style={{color: 'black'}}>English</option>
          <option value="kn" style={{color: 'black'}}>ಕನ್ನಡ</option>
          <option value="hi" style={{color: 'black'}}>हिन्दी</option>
        </select>
      </div>

      
      <div className="bottom-nav">
        <NavLink to="/settings" className={linkClass}>
          <Settings size={20} />
          <span>{t('settings')}</span>
        </NavLink>
        <button 
          onClick={onLogout}
          className="nav-item" 
          style={{ 
            background: 'none', 
            border: 'none', 
            width: '100%', 
            cursor: 'pointer', 
            justifyContent: 'flex-start',
            color: 'var(--accent-danger)'
          }}
        >
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};


export default Sidebar;
