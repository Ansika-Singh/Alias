import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, Users, GraduationCap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [role, setRole] = useState('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try backend auth first
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`https://Ansika26-Alias-backend.hf.space/api/auth/login?role=${role}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name || email);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('accessToken', data.access_token);
        onLogin();
        navigate('/');
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection to backend failed. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'principal', label: 'Principal', icon: Crown, color: '#f59e0b' },
    { id: 'teacher', label: 'Teacher', icon: ShieldCheck, color: 'var(--accent-primary)' },
    { id: 'student', label: 'Student', icon: GraduationCap, color: '#3b82f6' },
    { id: 'parent', label: 'Parent', icon: Users, color: '#10b981' },
  ];

  const placeholders = {
    principal: 'Principal ID (e.g., principal)',
    teacher: 'Teacher ID (e.g., teacher)',
    student: 'Student USN (e.g., 1XX19CS001)',
    parent: 'Ward USN (e.g., 1XX19CS001)'
  };

  const passwordHints = {
    principal: 'principal123',
    teacher: 'teacher123',
    student: 'Same as USN',
    parent: 'Parent PIN (default: 1234)'
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
        maxWidth: '480px',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        animation: 'fadeInUp 0.6s ease-out',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ALIAS</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Automated Live Identification & Attendance System</p>
        </div>

        {/* Role Toggle - 4 roles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '4px',
          background: 'rgba(0,0,0,0.04)',
          borderRadius: 'var(--radius-md)',
          gap: '3px'
        }}>
          {roles.map(r => (
            <button
              key={r.id}
              onClick={() => { setRole(r.id); setError(''); }}
              style={{
                padding: '0.6rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: role === r.id ? 'white' : 'transparent',
                color: role === r.id ? r.color : 'rgba(0,0,0,0.4)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                transition: 'all 0.3s',
                fontWeight: role === r.id ? '600' : '400',
                fontSize: '0.75rem',
                boxShadow: role === r.id ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <r.icon size={18} />
              {r.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)',
            color: '#dc2626',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, color: 'var(--text-primary)' }} />
            <input
              type="text"
              placeholder={placeholders[role]}
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

          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)', 
            textAlign: 'center',
            padding: '0.4rem 0.75rem',
            background: 'rgba(0,0,0,0.02)',
            borderRadius: '6px'
          }}>
            💡 Hint: {passwordHints[role]}
          </div>

          <button type="submit" className="btn-primary" style={{
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '0.25rem',
            opacity: loading ? 0.7 : 1
          }} disabled={loading}>
            {loading ? 'Authenticating...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            {!loading && <ArrowRight size={18} />}
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
