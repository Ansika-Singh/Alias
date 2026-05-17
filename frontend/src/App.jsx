import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ParentPortal from './pages/ParentPortal';

import Students from './pages/Students';
import Timetable from './pages/Timetable';
import PhotoAttendance from './pages/PhotoAttendance';
import Settings from './pages/Settings';
import StudentPortal from './pages/StudentPortal';
import QRAttendance from './pages/QRAttendance';
import AuditLog from './pages/AuditLog';
import Sidebar from './components/Sidebar';
import React, { useState, useEffect } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'teacher');

  const login = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    setUserRole(localStorage.getItem('userRole') || 'teacher');
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    setUserRole('teacher');
  };

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && userRole !== 'student' && userRole !== 'parent' && <Sidebar onLogout={logout} />}
        <div className={isAuthenticated && userRole !== 'student' && userRole !== 'parent' ? "main-content" : "full-content"}>
          <Routes>
            <Route path="/login" element={<Login onLogin={login} />} />

            <Route 
              path="/" 
              element={isAuthenticated ? (
                userRole === 'student' ? <Navigate to="/portal" /> : 
                userRole === 'parent' ? <Navigate to="/parent-portal" /> :
                <Dashboard />
              ) : <Navigate to="/login" />} 
            />
            <Route 
              path="/students" 
              element={isAuthenticated && (userRole === 'teacher' || userRole === 'principal') ? <Students /> : <Navigate to={isAuthenticated ? "/" : "/login"} />} 
            />
            <Route 
              path="/timetable" 
              element={isAuthenticated && (userRole === 'teacher' || userRole === 'principal') ? <Timetable /> : <Navigate to={isAuthenticated ? "/" : "/login"} />} 
            />
            <Route 
              path="/photo-attendance" 
              element={isAuthenticated && (userRole === 'teacher' || userRole === 'principal') ? <PhotoAttendance /> : <Navigate to={isAuthenticated ? "/" : "/login"} />} 
            />
            <Route 
              path="/qr-attendance" 
              element={isAuthenticated && (userRole === 'teacher' || userRole === 'principal') ? <QRAttendance /> : <Navigate to={isAuthenticated ? "/" : "/login"} />} 
            />
            <Route 
              path="/audit-log" 
              element={isAuthenticated && userRole === 'principal' ? <AuditLog /> : <Navigate to={isAuthenticated ? "/" : "/login"} />} 
            />
            <Route 
              path="/settings" 
              element={isAuthenticated && (userRole === 'teacher' || userRole === 'principal') ? <Settings /> : <Navigate to={isAuthenticated ? "/" : "/login"} />} 
            />
            <Route 
              path="/portal" 
              element={isAuthenticated && userRole === 'student' ? <StudentPortal onLogout={logout} /> : <Navigate to={isAuthenticated ? "/" : "/login"} />} 
            />
            <Route 
              path="/parent-portal" 
              element={isAuthenticated && userRole === 'parent' ? <ParentPortal onLogout={logout} /> : <Navigate to={isAuthenticated ? "/" : "/login"} />} 
            />
            {/* Catch all and redirect to login or dashboard */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}


export default App;
