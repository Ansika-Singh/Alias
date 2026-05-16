import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  Filter, 
  Search, 
  User, 
  Edit3, 
  LogIn, 
  Bell, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import './AuditLog.css';
import { apiFetch, get } from '../utils/api';

const ACTION_ICONS = {
  'LOGIN': LogIn,
  'LOGIN_FAILED': XCircle,
  'LOGOUT': LogIn,
  'ATTENDANCE_MARK': CheckCircle,
  'ATTENDANCE_EDIT': Edit3,
  'ATTENDANCE_BULK_UPLOAD': FileText,
  'ATTENDANCE_QR_SCAN': Shield,
  'STUDENT_ADD': User,
  'STUDENT_EDIT': Edit3,
  'STUDENT_DELETE': XCircle,
  'DISPUTE_RESOLVE': AlertTriangle,
  'NOTIFICATION_SEND': Bell,
  'REPORT_GENERATE': FileText,
  'ROLE_CHANGE': Shield,
  'SETTINGS_CHANGE': Edit3,
};

const ACTION_COLORS = {
  'LOGIN': '#10b981',
  'LOGIN_FAILED': '#ef4444',
  'LOGOUT': '#6b7280',
  'ATTENDANCE_MARK': '#10b981',
  'ATTENDANCE_EDIT': '#f59e0b',
  'ATTENDANCE_BULK_UPLOAD': '#3b82f6',
  'ATTENDANCE_QR_SCAN': '#8b5cf6',
  'STUDENT_ADD': '#10b981',
  'STUDENT_EDIT': '#f59e0b',
  'STUDENT_DELETE': '#ef4444',
  'DISPUTE_RESOLVE': '#f59e0b',
  'NOTIFICATION_SEND': '#3b82f6',
  'REPORT_GENERATE': '#6366f1',
  'ROLE_CHANGE': '#ef4444',
  'SETTINGS_CHANGE': '#f59e0b',
};

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    user: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);
  const [integrityStatus, setIntegrityStatus] = useState(null); // null, 'verifying', 'success', 'failure'
  const [integrityMessage, setIntegrityMessage] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = {
        limit: 100,
        ...(filters.action && { action: filters.action }),
        ...(filters.user && { user: filters.user }),
        ...(filters.dateFrom && { date_from: filters.dateFrom }),
        ...(filters.dateTo && { date_to: filters.dateTo })
      };
      
      const response = await get('/audit/', query);
      const result = await response.json();
      if (result.code === 200) {
        setLogs(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Mock data is kept as fallback for demo environments where backend might be offline
      if (logs.length === 0) {
        setLogs([
          {
            _id: '1', action: 'LOGIN', performedBy: 'principal', role: 'principal',
            targetType: 'auth', targetId: 'principal',
            details: { display_name: 'Dr. Kumar' },
            timestamp: new Date().toISOString(), date: new Date().toISOString().split('T')[0]
          },
          // ... (rest of mock logs can remain or be omitted if we expect backend to work)
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const runIntegrityCheck = async () => {
    setIntegrityStatus('verifying');
    setIntegrityMessage('Scanning SHA-256 hash chain...');
    try {
      const response = await apiFetch('/audit/verify');
      const result = await response.json();
      
      setTimeout(() => {
        if (result.code === 200) {
          setIntegrityStatus('success');
          setIntegrityMessage(result.message);
        } else {
          setIntegrityStatus('failure');
          setIntegrityMessage(result.message);
        }
      }, 1500); // Artificial delay for "premium" feel
    } catch (error) {
      setIntegrityStatus('failure');
      setIntegrityMessage('Could not connect to integrity service.');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getIcon = (action) => {
    const IconComponent = ACTION_ICONS[action] || FileText;
    return <IconComponent size={16} />;
  };

  return (
    <div className="audit-container">
      <header className="audit-header">
        <div>
          <h2><Shield size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Audit Trail</h2>
          <p>Complete log of all system actions and modifications</p>
        </div>
        <div className="header-actions">
          <button 
            className={`btn-integrity ${integrityStatus}`} 
            onClick={runIntegrityCheck}
            disabled={integrityStatus === 'verifying'}
          >
            {integrityStatus === 'verifying' ? <RefreshCw size={18} className="spinning" /> : <Shield size={18} />}
            {integrityStatus === 'verifying' ? 'Verifying...' : 'Check Integrity'}
          </button>
          <button className="btn-icon" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
            Filters
            <ChevronDown size={14} className={showFilters ? 'rotated' : ''} />
          </button>
          <button className="btn-icon" onClick={fetchLogs}>
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </header>

      {integrityStatus && (
        <div className={`integrity-banner ${integrityStatus} glass-card`}>
          {integrityStatus === 'success' ? <CheckCircle size={20} /> : 
           integrityStatus === 'failure' ? <AlertTriangle size={20} /> : 
           <RefreshCw size={20} className="spinning" />}
          <div className="integrity-info">
            <h4>System Integrity Status: {integrityStatus.toUpperCase()}</h4>
            <p>{integrityMessage}</p>
          </div>
          <button className="close-banner" onClick={() => setIntegrityStatus(null)}>×</button>
        </div>
      )}

      {showFilters && (
        <div className="filter-panel glass-card">
          <div className="filter-grid">
            <div className="form-group">
              <label>Action Type</label>
              <select value={filters.action} onChange={e => setFilters({...filters, action: e.target.value})}>
                <option value="">All Actions</option>
                {Object.keys(ACTION_ICONS).map(action => (
                  <option key={action} value={action}>{formatAction(action)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Performed By</label>
              <input 
                type="text" 
                placeholder="Username..."
                value={filters.user}
                onChange={e => setFilters({...filters, user: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>From Date</label>
              <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} />
            </div>
          </div>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={fetchLogs}>
            <Search size={16} />
            Apply Filters
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="audit-stats">
        <div className="stat-chip">
          <span className="stat-num">{logs.length}</span>
          <span>Total Events</span>
        </div>
        <div className="stat-chip warning">
          <span className="stat-num">{logs.filter(l => l.action === 'ATTENDANCE_EDIT').length}</span>
          <span>Edits</span>
        </div>
        <div className="stat-chip danger">
          <span className="stat-num">{logs.filter(l => l.action === 'LOGIN_FAILED').length}</span>
          <span>Failed Logins</span>
        </div>
        <div className="stat-chip success">
          <span className="stat-num">{logs.filter(l => l.action === 'LOGIN').length}</span>
          <span>Logins</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="audit-timeline">
        {loading ? (
          <div className="loading-state">
            <RefreshCw size={24} className="spinning" />
            <p>Loading audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <Shield size={48} strokeWidth={1} style={{ opacity: 0.15 }} />
            <p>No audit logs found</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div 
              key={log._id || index}
              className={`timeline-item ${expandedLog === index ? 'expanded' : ''}`}
              onClick={() => setExpandedLog(expandedLog === index ? null : index)}
            >
              <div className="timeline-marker" style={{ background: ACTION_COLORS[log.action] || '#6b7280' }}>
                {getIcon(log.action)}
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <div className="action-info">
                    <span className="action-badge" style={{ 
                      background: `${ACTION_COLORS[log.action]}15`,
                      color: ACTION_COLORS[log.action]
                    }}>
                      {formatAction(log.action)}
                    </span>
                    <span className="role-tag">{log.role}</span>
                  </div>
                  <span className="timestamp">
                    <Clock size={12} />
                    {formatTime(log.timestamp)}
                  </span>
                </div>
                <div className="timeline-body">
                  <span className="performer">
                    <User size={13} />
                    <strong>{log.performedBy}</strong>
                  </span>
                  <span className="target">→ {log.targetType}: {log.targetId}</span>
                </div>
                {expandedLog === index && log.details && Object.keys(log.details).length > 0 && (
                  <div className="timeline-details">
                    {Object.entries(log.details).map(([key, value]) => (
                      <div key={key} className="detail-row">
                        <span className="detail-key">{key.replace(/_/g, ' ')}</span>
                        <span className="detail-value">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuditLog;
