import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Settings, Video } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
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
        <NavLink to="/camera" className={linkClass}>
          <Video size={20} />
          <span>Live Feed</span>
        </NavLink>
      </nav>
      
      <div className="bottom-nav">
        <NavLink to="/settings" className={linkClass}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
