import React, { useState } from 'react';
import { Shield, Bell, MapPin, Clock, Database, Save, Server, Smartphone, Globe, Key, ToggleLeft, ToggleRight } from 'lucide-react';
import './Settings.css';

const Toggle = ({ enabled, onToggle, id }) => (
  <button id={id} className={`toggle-switch ${enabled ? 'on' : ''}`} onClick={onToggle}>
    {enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
  </button>
);

const Settings = () => {
  const [settings, setSettings] = useState({
    lateThreshold: 10,
    minAttendance: 75,
    campusLat: '12.9716',
    campusLng: '77.5946',
    geoRadius: 500,
    enableNotifications: true,
    enableSMS: false,
    enableEmail: true,
    enableGeoFence: true,
    enableLiveness: true,
    confidenceThreshold: 85,
    dbStatus: 'connected',
    apiUrl: 'http://localhost:8000',
  });

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    // In production, POST to /api/settings
    console.log('Saving settings:', settings);
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Configure system parameters and integrations.</p>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </header>

      <div className="settings-grid">
        {/* Attendance Rules */}
        <div className="glass-panel settings-card">
          <div className="settings-card-header">
            <Clock size={20} className="settings-icon" />
            <h3>Attendance Rules</h3>
          </div>
          <div className="settings-fields">
            <div className="field-row">
              <div className="field-info">
                <label htmlFor="late-threshold">Late Threshold (minutes)</label>
                <p>Grace period after class starts before marking LATE.</p>
              </div>
              <input id="late-threshold" type="number" min="1" max="30"
                value={settings.lateThreshold} onChange={e => update('lateThreshold', parseInt(e.target.value))} />
            </div>
            <div className="field-row">
              <div className="field-info">
                <label htmlFor="min-attendance">Minimum Attendance %</label>
                <p>Students below this are flagged as at-risk.</p>
              </div>
              <input id="min-attendance" type="number" min="50" max="100"
                value={settings.minAttendance} onChange={e => update('minAttendance', parseInt(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Face Recognition */}
        <div className="glass-panel settings-card">
          <div className="settings-card-header">
            <Shield size={20} className="settings-icon" />
            <h3>Face Recognition</h3>
          </div>
          <div className="settings-fields">
            <div className="field-row">
              <div className="field-info">
                <label htmlFor="confidence-threshold">Confidence Threshold %</label>
                <p>Minimum match confidence required for identification.</p>
              </div>
              <input id="confidence-threshold" type="number" min="50" max="100"
                value={settings.confidenceThreshold} onChange={e => update('confidenceThreshold', parseInt(e.target.value))} />
            </div>
            <div className="field-row">
              <div className="field-info">
                <label>Liveness Detection</label>
                <p>Require blink/motion verification to prevent spoofing.</p>
              </div>
              <Toggle id="toggle-liveness" enabled={settings.enableLiveness} onToggle={() => update('enableLiveness', !settings.enableLiveness)} />
            </div>
          </div>
        </div>

        {/* Geo-Fencing */}
        <div className="glass-panel settings-card">
          <div className="settings-card-header">
            <MapPin size={20} className="settings-icon" />
            <h3>Geo-Fencing</h3>
          </div>
          <div className="settings-fields">
            <div className="field-row">
              <div className="field-info">
                <label>Enable Geo-Fence</label>
                <p>Restrict QR check-in to campus area only.</p>
              </div>
              <Toggle id="toggle-geofence" enabled={settings.enableGeoFence} onToggle={() => update('enableGeoFence', !settings.enableGeoFence)} />
            </div>
            <div className="field-row">
              <div className="field-info">
                <label htmlFor="campus-lat">Campus Coordinates</label>
                <p>Latitude and longitude of the campus center.</p>
              </div>
              <div className="coord-inputs">
                <input id="campus-lat" type="text" placeholder="Lat" value={settings.campusLat} onChange={e => update('campusLat', e.target.value)} />
                <input id="campus-lng" type="text" placeholder="Lng" value={settings.campusLng} onChange={e => update('campusLng', e.target.value)} />
              </div>
            </div>
            <div className="field-row">
              <div className="field-info">
                <label htmlFor="geo-radius">Allowed Radius (meters)</label>
                <p>Maximum distance from campus center for check-in.</p>
              </div>
              <input id="geo-radius" type="number" min="50" max="5000"
                value={settings.geoRadius} onChange={e => update('geoRadius', parseInt(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-panel settings-card">
          <div className="settings-card-header">
            <Bell size={20} className="settings-icon" />
            <h3>Notifications</h3>
          </div>
          <div className="settings-fields">
            <div className="field-row">
              <div className="field-info">
                <label>Enable Notifications</label>
                <p>Send alerts to parents for absences.</p>
              </div>
              <Toggle id="toggle-notifications" enabled={settings.enableNotifications} onToggle={() => update('enableNotifications', !settings.enableNotifications)} />
            </div>
            <div className="field-row">
              <div className="field-info">
                <label>SMS Notifications</label>
                <p>Send SMS via Twilio integration.</p>
              </div>
              <Toggle id="toggle-sms" enabled={settings.enableSMS} onToggle={() => update('enableSMS', !settings.enableSMS)} />
            </div>
            <div className="field-row">
              <div className="field-info">
                <label>Email Notifications</label>
                <p>Send email alerts for attendance reports.</p>
              </div>
              <Toggle id="toggle-email" enabled={settings.enableEmail} onToggle={() => update('enableEmail', !settings.enableEmail)} />
            </div>
          </div>
        </div>

        {/* System Status - Full Width */}
        <div className="glass-panel settings-card full-width">
          <div className="settings-card-header">
            <Server size={20} className="settings-icon" />
            <h3>System Status</h3>
          </div>
          <div className="system-status-grid">
            <div className="status-item">
              <Database size={18} />
              <div className="status-info">
                <span className="status-name">MongoDB</span>
                <span className="status-value connected">Connected</span>
              </div>
            </div>
            <div className="status-item">
              <Globe size={18} />
              <div className="status-info">
                <span className="status-name">API Server</span>
                <span className="status-value connected">Running on :8000</span>
              </div>
            </div>
            <div className="status-item">
              <Smartphone size={18} />
              <div className="status-info">
                <span className="status-name">Mobile App</span>
                <span className="status-value pending">Not Connected</span>
              </div>
            </div>
            <div className="status-item">
              <Key size={18} />
              <div className="status-info">
                <span className="status-name">JWT Auth</span>
                <span className="status-value connected">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
