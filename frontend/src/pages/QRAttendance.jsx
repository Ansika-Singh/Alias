import React, { useState, useEffect, useRef } from 'react';
import { QrCode, RefreshCw, Shield, Clock, Users, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './QRAttendance.css';
import { get, post } from '../utils/api';

const QRAttendance = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const T = {
    title:        { en: 'QR Attendance',       hi: 'QR उपस्थिति',         kn: 'QR ಹಾಜರಾತಿ' },
    subtitle:     { en: 'Generate rotating QR codes for secure attendance verification', hi: 'सुरक्षित उपस्थिति सत्यापन के लिए घूमने वाले QR कोड बनाएं', kn: 'ಸುರಕ್ಷಿತ ಹಾಜರಾತಿ ಪರಿಶೀಲನೆಗಾಗಿ ತಿರುಗುವ QR ಕೋಡ್‌ಗಳನ್ನು ರಚಿಸಿ' },
    secured:      { en: 'TOTP Secured • 30s Rotation', hi: 'TOTP सुरक्षित • 30 सेकंड रोटेशन', kn: 'TOTP ಸುರಕ್ಷಿತ • 30 ಸೆಕೆಂಡ್ ರೊಟೇಶನ್' },
    sessionConfig:{ en: 'Session Configuration', hi: 'सत्र कॉन्फ़िगरेशन', kn: 'ಸೆಷನ್ ಕಾನ್ಫಿಗರೇಶನ್' },
    section:      { en: 'Section',    hi: 'सेक्शन',   kn: 'ವಿಭಾಗ' },
    semester:     { en: 'Semester',   hi: 'सेमेस्टर', kn: 'ಸೆಮಿಸ್ಟರ್' },
    subject:      { en: 'Subject',    hi: 'विषय',     kn: 'ವಿಷಯ' },
    startSession: { en: 'Start QR Session', hi: 'QR सत्र शुरू करें', kn: 'QR ಸೆಷನ್ ಪ್ರಾರಂಭಿಸಿ' },
    endSession:   { en: 'End Session', hi: 'सत्र समाप्त करें', kn: 'ಸೆಷನ್ ಮುಗಿಸಿ' },
    configure:    { en: 'Configure and start a session to generate QR codes', hi: 'QR कोड बनाने के लिए सत्र कॉन्फ़िगर करें', kn: 'QR ಕೋಡ್‌ಗಳನ್ನು ರಚಿಸಲು ಸೆಷನ್ ಕಾನ್ಫಿಗರ್ ಮಾಡಿ' },
    liveFeed:     { en: 'Live Scan Feed', hi: 'लाइव स्कैन फ़ीड', kn: 'ಲೈವ್ ಸ್ಕ್ಯಾನ್ ಫೀಡ್' },
    scanned:      { en: 'scanned', hi: 'स्कैन किए', kn: 'ಸ್ಕ್ಯಾನ್ ಆಗಿದೆ' },
    scansAppear:  { en: 'Scans will appear here in real-time', hi: 'स्कैन यहाँ रियल-टाइम में दिखेंगे', kn: 'ಸ್ಕ್ಯಾನ್‌ಗಳು ಇಲ್ಲಿ ರಿಯಲ್-ಟೈಮ್‌ನಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ' },
    autoRefresh:  { en: 'Auto-refreshing every 30 seconds', hi: 'हर 30 सेकंड में स्वतः रीफ्रेश', kn: 'ಪ್ರತಿ 30 ಸೆಕೆಂಡ್‌ಗೆ ಸ್ವಯಂ ರಿಫ್ರೆಶ್' },
    instruction:  { en: 'Display this QR code on the projector. Students scan with their phones to mark attendance.', hi: 'इस QR कोड को प्रोजेक्टर पर दिखाएं। छात्र अपने फोन से स्कैन करके उपस्थिति दर्ज करें।', kn: 'ಈ QR ಕೋಡ್ ಅನ್ನು ಪ್ರೊಜೆಕ್ಟರ್‌ನಲ್ಲಿ ತೋರಿಸಿ. ವಿದ್ಯಾರ್ಥಿಗಳು ತಮ್ಮ ಫೋನ್‌ನಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಹಾಜರಾತಿ ದಾಖಲಿಸಿ.' },
  };
  const t = (key) => T[key]?.[lang] || T[key]?.en || key;
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [scanLog, setScanLog] = useState([]);
  const [sessionConfig, setSessionConfig] = useState({
    section: 'A',
    semester: 6,
    subject: 'Data Structures'
  });
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const pollRef = useRef(null);

  const subjects = ['Data Structures', 'Algorithms', 'Operating Systems', 'Computer Networks', 'Database Systems'];

  const generateQR = async () => {
    setLoading(true);
    try {
      const response = await post('/qr/generate', sessionConfig);
      const result = await response.json();
      if (result.code === 200) {
        setQrData(result.data);
        setCountdown(result.data.expires_in || 30);
      }
    } catch (error) {
      console.error('Error generating QR:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = () => {
    setIsActive(true);
    generateQR();
    
    // Auto-refresh QR every 30 seconds
    intervalRef.current = setInterval(() => {
      generateQR();
    }, 30000);

    // Start polling for scans
    startPolling();
  };

  const startPolling = () => {
    // Initial fetch
    fetchLiveScans();
    // Poll every 3 seconds
    pollRef.current = setInterval(() => {
      fetchLiveScans();
    }, 3000);
  };

  const fetchLiveScans = async () => {
    if (!qrData?.session_id) return;
    try {
      const response = await get(`/qr/scans/${qrData.session_id}`);
      const result = await response.json();
      if (result.code === 200) {
        setScanLog(result.data);
      }
    } catch (error) {
      console.error('Error polling scans:', error);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setQrData(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  // Countdown timer
  useEffect(() => {
    if (isActive && qrData) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isActive, qrData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Generate QR code SVG (simple representation)
  const renderQRCode = () => {
    if (!qrData) return null;
    
    const token = qrData.token || '';
    // Create a visual QR-like pattern from the token
    const cells = [];
    const size = 15;
    
    // Use token characters to seed a pattern
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Corner markers (QR finder patterns)
        const isCornerMarker = (
          (row < 3 && col < 3) || 
          (row < 3 && col >= size - 3) || 
          (row >= size - 3 && col < 3)
        );
        const isCornerInner = (
          (row === 1 && col === 1) || 
          (row === 1 && col === size - 2) || 
          (row === size - 2 && col === 1)
        );
        
        if (isCornerMarker && !isCornerInner) {
          cells.push({ row, col, filled: true });
        } else if (isCornerInner) {
          cells.push({ row, col, filled: true });
        } else {
          // Data cells - use hash of token + position
          const charIndex = (row * size + col) % token.length;
          const charCode = token.charCodeAt(charIndex) || 0;
          const filled = ((charCode + row * 7 + col * 13) % 3) !== 0;
          cells.push({ row, col, filled });
        }
      }
    }
    
    const cellSize = 16;
    const padding = 20;
    const svgSize = size * cellSize + padding * 2;
    
    return (
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="qr-svg">
        <rect width={svgSize} height={svgSize} fill="white" rx="12" />
        {cells.map((cell, idx) => (
          cell.filled && (
            <rect
              key={idx}
              x={padding + cell.col * cellSize}
              y={padding + cell.row * cellSize}
              width={cellSize - 1}
              height={cellSize - 1}
              fill="#1a1a2e"
              rx="2"
            />
          )
        ))}
      </svg>
    );
  };

  return (
    <div className="qr-attendance-container">
      <header className="qr-header">
        <div>
          <h2><QrCode size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />{t('title')}</h2>
          <p>{t('subtitle')}</p>
        </div>
        <div className="security-badge">
          <Shield size={16} />
          <span>{t('secured')}</span>
        </div>
      </header>

      <div className="qr-grid">
        <div className="glass-card config-panel">
          <h3>{t('sessionConfig')}</h3>
          <div className="config-form">
            <div className="form-group">
              <label>{t('section')}</label>
              <select value={sessionConfig.section} onChange={e => setSessionConfig({...sessionConfig, section: e.target.value})} disabled={isActive}>
                <option value="A">{t('section')} A</option>
                <option value="B">{t('section')} B</option>
                <option value="C">{t('section')} C</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('semester')}</label>
              <select value={sessionConfig.semester} onChange={e => setSessionConfig({...sessionConfig, semester: parseInt(e.target.value)})} disabled={isActive}>
                {[1,2,3,4,5,6,7,8].map(s => (
                  <option key={s} value={s}>{t('semester')} {s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t('subject')}</label>
              <select value={sessionConfig.subject} onChange={e => setSessionConfig({...sessionConfig, subject: e.target.value})} disabled={isActive}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {!isActive ? (
            <button className="btn-start" onClick={startSession}><QrCode size={20} />{t('startSession')}</button>
          ) : (
            <button className="btn-stop" onClick={stopSession}><XCircle size={20} />{t('endSession')}</button>
          )}
        </div>

        <div className="glass-card qr-display-panel">
          {isActive && qrData ? (
            <>
              <div className="qr-code-wrapper">
                {renderQRCode()}
                <div className={`countdown-ring ${countdown <= 5 ? 'urgent' : ''}`}>
                  <svg viewBox="0 0 40 40" className="countdown-svg">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
                    <circle cx="20" cy="20" r="18" fill="none" stroke={countdown <= 5 ? '#ef4444' : 'var(--accent-primary)'} strokeWidth="2" strokeDasharray={`${(countdown / 30) * 113} 113`} strokeLinecap="round" transform="rotate(-90 20 20)" style={{ transition: 'stroke-dasharray 1s linear' }} />
                  </svg>
                  <span className="countdown-text">{countdown}s</span>
                </div>
              </div>
              <div className="qr-meta">
                <div className="meta-item"><Clock size={14} /><span>Token: <strong>{qrData.token}</strong></span></div>
                <div className="meta-item"><RefreshCw size={14} className={isActive ? 'spinning' : ''} /><span>{t('autoRefresh')}</span></div>
                <p className="qr-instruction">{t('instruction')}</p>
              </div>
            </>
          ) : (
            <div className="qr-placeholder">
              <QrCode size={80} strokeWidth={1} style={{ opacity: 0.15 }} />
              <p>{t('configure')}</p>
            </div>
          )}
        </div>

        <div className="glass-card scan-log-panel">
          <div className="card-header">
            <h3>{t('liveFeed')}</h3>
            <span className="scan-count"><Users size={14} />{scanLog.length} {t('scanned')}</span>
          </div>
          {scanLog.length === 0 ? (
            <div className="empty-log">
              <CheckCircle2 size={40} strokeWidth={1} style={{ opacity: 0.15 }} />
              <p>{t('scansAppear')}</p>
            </div>
          ) : (
            <div className="scan-list">
              {scanLog.map((scan, i) => (
                <div key={i} className="scan-item">
                  <CheckCircle2 size={16} color="var(--accent-success)" />
                  <div className="scan-info"><strong>{scan.name}</strong><span>{scan.time}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRAttendance;
