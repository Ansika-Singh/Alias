import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, Users, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [role, setRole] = useState('teacher'); // 'teacher' or 'parent'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, validate credentials here
    console.log(`Logging in as ${role}:`, { email, password });
    localStorage.setItem('userRole', role);
    onLogin(); // Update App state
    navigate('/'); // Redirect to dashboard
  };



  return (
    <div className="login-container" style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, rgba(236, 72, 153, 0.1), transparent), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.1), transparent)',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      {/* Abstract Background Shapes */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'var(--accent-primary)', filter: 'blur(150px)', opacity: 0.1, top: '10%', left: '10%', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'var(--accent-secondary)', filter: 'blur(200px)', opacity: 0.1, bottom: '10%', right: '10%', borderRadius: '50%' }} />

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        animation: 'fadeInUp 0.6s ease-out',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ALIAS</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Automated Live Identification & Attendance System</p>
        </div>

        {/* Role Toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: '4px',
          background: 'rgba(0,0,0,0.05)',
          borderRadius: 'var(--radius-md)',
          gap: '4px'
        }}>
          <button
            onClick={() => setRole('teacher')}
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: role === 'teacher' ? 'white' : 'transparent',
              color: role === 'teacher' ? 'var(--accent-primary)' : 'rgba(0,0,0,0.5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s',
              fontWeight: role === 'teacher' ? '600' : '400',
              boxShadow: role === 'teacher' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <ShieldCheck size={18} />
            Teacher
          </button>
          <button
            onClick={() => setRole('parent')}
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: role === 'parent' ? 'white' : 'transparent',
              color: role === 'parent' ? 'var(--accent-primary)' : 'rgba(0,0,0,0.5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s',
              fontWeight: role === 'parent' ? '600' : '400',
              boxShadow: role === 'parent' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <Users size={18} />
            Parent
          </button>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, color: 'var(--text-primary)' }} />
            <input
              type="email"
              placeholder={role === 'teacher' ? "Teacher ID or Email" : "Student USN or Parent Email"}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                background: 'white',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, color: 'var(--text-primary)' }} />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                background: 'white',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
          </div>


          <button type="submit" className="btn-primary" style={{
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '0.5rem'
          }}>
            Login as {role.charAt(0).toUpperCase() + role.slice(1)}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Cambridge Institute of Technology Portal
          </p>
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Forgot Password?</a>
            <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Help Desk</a>
          </div>
        </div>
      </div>
      
      {/* Branding Info */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        textAlign: 'center',
        opacity: 0.4,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <GraduationCap size={20} />
        <span style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>SECURED ACADEMIC PORTAL</span>
      </div>
    </div>
  );
};

export default Login;
