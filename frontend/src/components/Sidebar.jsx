import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Settings, Camera } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => {
  const linkClass = ({ isActive }) => isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="sidebar glass-panel">
      <div className="logo-container">
        <h1 className="text-gradient">ALIAS</h1>
        <p className="subtitle">Admin Portal</p>
      </div>
      
      <nav className="nav-menu">
        <NavLink to="/" end className={linkClass}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/students" className={linkClass}>
          <Users size={20} />
          <span>Students</span>
        </NavLink>
        <NavLink to="/timetable" className={linkClass}>
          <Calendar size={20} />
          <span>Timetable</span>
        </NavLink>
        <NavLink to="/photo-attendance" className={linkClass}>
          <Camera size={20} />
          <span>Photo Attendance</span>
        </NavLink>
      </nav>

      
      <div className="bottom-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <NavLink to="/settings" className={linkClass}>
          <Settings size={20} />
          <span>Settings</span>
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
          <LayoutDashboard size={20} /> {/* Using as placeholder for logout icon if LogOut not imported */}
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};


export default Sidebar;
