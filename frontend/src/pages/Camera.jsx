import React, { useState, useEffect } from 'react';
import { Video, Wifi, WifiOff, Activity, Users, Eye, RefreshCw, Maximize2, AlertTriangle } from 'lucide-react';
import './Camera.css';

const MOCK_NODES = [
  { id: 'cam-01', name: 'Main Hall Entrance', location: 'Building A - Ground Floor', status: 'online', fps: 28, detections: 12, lastPing: '2s ago' },
  { id: 'cam-02', name: 'CS Department Lab', location: 'Building B - 2nd Floor', status: 'online', fps: 25, detections: 8, lastPing: '1s ago' },
  { id: 'cam-03', name: 'Library Gate', location: 'Building C - Ground Floor', status: 'offline', fps: 0, detections: 0, lastPing: '5m ago' },
  { id: 'cam-04', name: 'Auditorium', location: 'Building A - 1st Floor', status: 'online', fps: 30, detections: 45, lastPing: '1s ago' },
];

const MOCK_RECENT_DETECTIONS = [
  { name: 'Alex Johnson', usn: '1XX19CS001', time: '21:18:32', confidence: 98.2, camera: 'Main Hall Entrance' },
  { name: 'Priya Patel', usn: '1XX19CS102', time: '21:18:28', confidence: 96.7, camera: 'Main Hall Entrance' },
  { name: 'Rahul Sharma', usn: '1XX19CS055', time: '21:18:15', confidence: 99.1, camera: 'CS Department Lab' },
  { name: 'Sarah Smith', usn: '1XX19CS042', time: '21:17:55', confidence: 94.3, camera: 'CS Department Lab' },
  { name: 'Lisa Chen', usn: '1XX19CS071', time: '21:17:42', confidence: 97.8, camera: 'Auditorium' },
  { name: 'David Wilson', usn: '1XX19EC015', time: '21:17:30', confidence: 95.5, camera: 'Auditorium' },
];

const Camera = () => {
  const [selectedNode, setSelectedNode] = useState(MOCK_NODES[0]);
  const [pulseKey, setPulseKey] = useState(0);

  // Simulate live pulse
  useEffect(() => {
    const interval = setInterval(() => setPulseKey(k => k + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = MOCK_NODES.filter(n => n.status === 'online').length;
  const totalDetections = MOCK_NODES.reduce((sum, n) => sum + n.detections, 0);

  return (
    <div className="camera-page">
      <header className="page-header">
        <div>
          <h2 className="page-title">Live Camera Feed</h2>
          <p className="page-subtitle">Real-time face recognition monitoring.</p>
        </div>
        <div className="header-actions">
          <div className="live-indicator">
            <span className="live-dot" key={pulseKey} />
            <span>LIVE</span>
          </div>
        </div>
      </header>

      {/* Status Strip */}
      <div className="camera-stats-row">
        <div className="mini-stat glass-panel">
          <span className="mini-stat-value" style={{ color: 'var(--accent-success)' }}>{onlineCount}</span>
          <span className="mini-stat-label">Nodes Online</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-value" style={{ color: 'var(--accent-danger)' }}>{MOCK_NODES.length - onlineCount}</span>
          <span className="mini-stat-label">Nodes Offline</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-value">{totalDetections}</span>
          <span className="mini-stat-label">Detections Today</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-value" style={{ color: 'var(--accent-secondary)' }}>{selectedNode?.fps || 0}</span>
          <span className="mini-stat-label">Active FPS</span>
        </div>
      </div>

      <div className="camera-layout">
        {/* Main Feed View */}
        <div className="feed-section">
          <div className="glass-panel feed-container">
            <div className="feed-header">
              <div className="feed-title">
                <Video size={18} />
                <span>{selectedNode.name}</span>
              </div>
              <div className="feed-controls">
                <button className="btn-icon" title="Refresh">
                  <RefreshCw size={16} />
                </button>
                <button className="btn-icon" title="Fullscreen">
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>
            <div className="feed-viewport">
              {selectedNode.status === 'online' ? (
                <>
                  <div className="feed-placeholder">
                    <div className="scan-line" key={pulseKey} />
                    <div className="feed-grid-overlay" />
                    <div className="feed-center-content">
                      <Eye size={48} style={{ opacity: 0.3 }} />
                      <p>Camera feed streaming</p>
                      <span className="feed-info">{selectedNode.location}</span>
                    </div>
                    {/* Simulated detection boxes */}
                    <div className="detection-box" style={{ top: '25%', left: '20%', width: '60px', height: '70px' }}>
                      <span className="detection-label">Alex J. (98%)</span>
                    </div>
                    <div className="detection-box" style={{ top: '30%', left: '55%', width: '55px', height: '65px' }}>
                      <span className="detection-label">Priya P. (97%)</span>
                    </div>
                  </div>
                  <div className="feed-status-bar">
                    <span className="feed-stat"><Activity size={12} /> {selectedNode.fps} FPS</span>
                    <span className="feed-stat"><Users size={12} /> {selectedNode.detections} detected</span>
                    <span className="feed-stat"><Wifi size={12} /> Last ping: {selectedNode.lastPing}</span>
                  </div>
                </>
              ) : (
                <div className="feed-offline">
                  <WifiOff size={48} />
                  <p>Camera node offline</p>
                  <span>Last seen: {selectedNode.lastPing}</span>
                  <button className="btn-primary" style={{ marginTop: '1rem' }}>
                    <RefreshCw size={14} />
                    Retry Connection
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Detections */}
          <div className="glass-panel detections-log">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={18} />
              Recent Detections
            </h3>
            <div className="detections-list">
              {MOCK_RECENT_DETECTIONS.map((d, idx) => (
                <div key={idx} className="detection-item">
                  <div className="detection-avatar">
                    <Users size={14} />
                  </div>
                  <div className="detection-info">
                    <span className="detection-name">{d.name}</span>
                    <span className="detection-usn">{d.usn}</span>
                  </div>
                  <div className="detection-meta">
                    <span className="detection-confidence">{d.confidence}%</span>
                    <span className="detection-time">{d.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Node List Sidebar */}
        <div className="nodes-sidebar">
          <div className="glass-panel">
            <h3 style={{ marginBottom: '1rem' }}>Camera Nodes</h3>
            <div className="nodes-list">
              {MOCK_NODES.map(node => (
                <button
                  key={node.id}
                  id={`node-${node.id}`}
                  className={`node-card ${selectedNode.id === node.id ? 'active' : ''} ${node.status}`}
                  onClick={() => setSelectedNode(node)}
                >
                  <div className="node-status-dot" />
                  <div className="node-info">
                    <span className="node-name">{node.name}</span>
                    <span className="node-location">{node.location}</span>
                  </div>
                  {node.status === 'offline' && <AlertTriangle size={14} className="node-alert" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Camera;
