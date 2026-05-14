import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

import Students from './pages/Students';
import Timetable from './pages/Timetable';
import PhotoAttendance from './pages/PhotoAttendance';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import React, { useState, useEffect } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');

  const login = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && <Sidebar onLogout={logout} />}
        <main className={isAuthenticated ? "main-content" : "full-content"}>
          <Routes>
            <Route path="/login" element={<Login onLogin={login} />} />

            <Route 
              path="/" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/students" 
              element={isAuthenticated ? <Students /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/timetable" 
              element={isAuthenticated ? <Timetable /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/photo-attendance" 
              element={isAuthenticated ? <PhotoAttendance /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/settings" 
              element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} 
            />
            {/* Catch all and redirect to login or dashboard */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


export default App;
