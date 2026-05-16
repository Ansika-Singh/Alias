import React, { useState } from 'react';
import { Shield, Bell, MapPin, Clock, Database, Save, Server, Smartphone, Globe, Key, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Settings.css';

const Toggle = ({ enabled, onToggle }) => (
  <button className={`toggle-switch ${enabled ? 'on' : ''}`} onClick={onToggle}>
    {enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
  </button>
);

const Settings = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const [settings, setSettings] = useState({
    lateThreshold: 10, minAttendance: 75,
    campusLat: '12.9716', campusLng: '77.5946', geoRadius: 500,
    enableNotifications: true, enableSMS: false, enableEmail: true,
    enableGeoFence: true, enableLiveness: true, confidenceThreshold: 85,
  });
  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const T = {
    settingsTitle:   { en: 'Settings',              hi: 'सेटिंग्स',              kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು' },
    configureSystem: { en: 'Configure system parameters and integrations.', hi: 'सिस्टम पैरामीटर और एकीकरण कॉन्फ़िगर करें।', kn: 'ಸಿಸ್ಟಮ್ ನಿಯತಾಂಕಗಳು ಮತ್ತು ಏಕೀಕರಣಗಳನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಿ.' },
    saveChanges:     { en: 'Save Changes',           hi: 'परिवर्तन सहेजें',       kn: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ' },

    // Attendance Rules
    attendanceRules: { en: 'Attendance Rules',       hi: 'उपस्थिति नियम',         kn: 'ಹಾಜರಾತಿ ನಿಯಮಗಳು' },
    lateThreshold:   { en: 'Late Threshold (minutes)', hi: 'देर सीमा (मिनट)',     kn: 'ತಡ ಮಿತಿ (ನಿಮಿಷ)' },
    lateDesc:        { en: 'Grace period after class starts before marking LATE.', hi: 'कक्षा शुरू होने के बाद LATE मार्क करने से पहले की अनुग्रह अवधि।', kn: 'ತರಗತಿ ಪ್ರಾರಂಭವಾದ ನಂತರ LATE ಗುರುತಿಸುವ ಮೊದಲು ಅನುಗ್ರಹ ಅವಧಿ.' },
    minAttendance:   { en: 'Minimum Attendance %',   hi: 'न्यूनतम उपस्थिति %',    kn: 'ಕನಿಷ್ಠ ಹಾಜರಾತಿ %' },
    minAttDesc:      { en: 'Students below this are flagged as at-risk.', hi: 'इससे कम वाले छात्रों को जोखिम में चिह्नित किया जाता है।', kn: 'ಇದಕ್ಕಿಂತ ಕಡಿಮೆ ಇರುವ ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಅಪಾಯದಲ್ಲಿ ಎಂದು ಗುರುತಿಸಲಾಗುತ್ತದೆ.' },

    // Face Recognition
    faceRecognition: { en: 'Face Recognition',       hi: 'चेहरा पहचान',           kn: 'ಮುಖ ಗುರುತಿಸುವಿಕೆ' },
    confidenceThreshold: { en: 'Confidence Threshold %', hi: 'विश्वास सीमा %',    kn: 'ವಿಶ್ವಾಸ ಮಿತಿ %' },
    confidenceDesc:  { en: 'Minimum match confidence required for identification.', hi: 'पहचान के लिए आवश्यक न्यूनतम मिलान विश्वास।', kn: 'ಗುರುತಿಸಲು ಅಗತ್ಯವಿರುವ ಕನಿಷ್ಠ ಹೊಂದಾಣಿಕೆ ವಿಶ್ವಾಸ.' },
    livenessDetection: { en: 'Liveness Detection',   hi: 'जीवंतता पहचान',         kn: 'ಜೀವಂತ ಪತ್ತೆ' },
    livenessDesc:    { en: 'Require blink/motion verification to prevent spoofing.', hi: 'स्पूफिंग रोकने के लिए पलक/गति सत्यापन आवश्यक।', kn: 'ಸ್ಪೂಫಿಂಗ್ ತಡೆಯಲು ಕಣ್ಣು ಮಿಟುಕಿಸುವಿಕೆ/ಚಲನೆ ಪರಿಶೀಲನೆ ಅಗತ್ಯ.' },

    // Geo-Fencing
    geoFencing:      { en: 'Geo-Fencing',            hi: 'जियो-फेंसिंग',          kn: 'ಜಿಯೋ-ಫೆನ್ಸಿಂಗ್' },
    enableGeoFence:  { en: 'Enable Geo-Fence',       hi: 'जियो-फेंस सक्षम करें',  kn: 'ಜಿಯೋ-ಫೆನ್ಸ್ ಸಕ್ರಿಯಗೊಳಿಸಿ' },
    geoFenceDesc:    { en: 'Restrict QR check-in to campus area only.', hi: 'QR चेक-इन को केवल कैंपस क्षेत्र तक सीमित करें।', kn: 'QR ಚೆಕ್-ಇನ್ ಅನ್ನು ಕ್ಯಾಂಪಸ್ ಪ್ರದೇಶಕ್ಕೆ ಮಾತ್ರ ಸೀಮಿತಗೊಳಿಸಿ.' },
    campusCoords:    { en: 'Campus Coordinates',     hi: 'कैंपस निर्देशांक',       kn: 'ಕ್ಯಾಂಪಸ್ ನಿರ್ದೇಶಾಂಕಗಳು' },
    coordsDesc:      { en: 'Latitude and longitude of the campus center.', hi: 'कैंपस केंद्र का अक्षांश और देशांतर।', kn: 'ಕ್ಯಾಂಪಸ್ ಕೇಂದ್ರದ ಅಕ್ಷಾಂಶ ಮತ್ತು ರೇಖಾಂಶ.' },
    allowedRadius:   { en: 'Allowed Radius (meters)', hi: 'अनुमत त्रिज्या (मीटर)', kn: 'ಅನುಮತಿಸಿದ ತ್ರಿಜ್ಯ (ಮೀಟರ್)' },
    radiusDesc:      { en: 'Maximum distance from campus center for check-in.', hi: 'चेक-इन के लिए कैंपस केंद्र से अधिकतम दूरी।', kn: 'ಚೆಕ್-ಇನ್‌ಗಾಗಿ ಕ್ಯಾಂಪಸ್ ಕೇಂದ್ರದಿಂದ ಗರಿಷ್ಠ ದೂರ.' },

    // Notifications
    notifications:   { en: 'Notifications',          hi: 'सूचनाएं',               kn: 'ಅಧಿಸೂಚನೆಗಳು' },
    enableNotif:     { en: 'Enable Notifications',   hi: 'सूचनाएं सक्षम करें',    kn: 'ಅಧಿಸೂಚನೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ' },
    enableNotifDesc: { en: 'Send alerts to parents for absences.', hi: 'अनुपस्थिति के लिए माता-पिता को अलर्ट भेजें।', kn: 'ಗೈರುಹಾಜರಿಗಾಗಿ ಪೋಷಕರಿಗೆ ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಿ.' },
    smsNotif:        { en: 'SMS Notifications',      hi: 'SMS सूचनाएं',            kn: 'SMS ಅಧಿಸೂಚನೆಗಳು' },
    smsDesc:         { en: 'Send SMS via Twilio integration.', hi: 'Twilio एकीकरण के माध्यम से SMS भेजें।', kn: 'Twilio ಏಕೀಕರಣದ ಮೂಲಕ SMS ಕಳುಹಿಸಿ.' },
    emailNotif:      { en: 'Email Notifications',    hi: 'ईमेल सूचनाएं',           kn: 'ಇಮೇಲ್ ಅಧಿಸೂಚನೆಗಳು' },
    emailDesc:       { en: 'Send email alerts for attendance reports.', hi: 'उपस्थिति रिपोर्ट के लिए ईमेल अलर्ट भेजें।', kn: 'ಹಾಜರಾತಿ ವರದಿಗಳಿಗಾಗಿ ಇಮೇಲ್ ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಿ.' },

    // System Status
    systemStatus:    { en: 'System Status',          hi: 'सिस्टम स्थिति',          kn: 'ಸಿಸ್ಟಮ್ ಸ್ಥಿತಿ' },
    connected:       { en: 'Connected',              hi: 'जुड़ा हुआ',              kn: 'ಸಂಪರ್ಕಿತ' },
    running:         { en: 'Running on :8000',       hi: ':8000 पर चल रहा है',     kn: ':8000 ನಲ್ಲಿ ಚಾಲನೆಯಲ್ಲಿದೆ' },
    notConnected:    { en: 'Not Connected',          hi: 'जुड़ा नहीं',             kn: 'ಸಂಪರ್ಕಿತವಾಗಿಲ್ಲ' },
    active:          { en: 'Active',                 hi: 'सक्रिय',                 kn: 'ಸಕ್ರಿಯ' },
    mobileApp:       { en: 'Mobile App',             hi: 'मोबाइल ऐप',              kn: 'ಮೊಬೈಲ್ ಅಪ್ಲಿಕೇಶನ್' },
    apiServer:       { en: 'API Server',             hi: 'API सर्वर',              kn: 'API ಸರ್ವರ್' },
    jwtAuth:         { en: 'JWT Auth',               hi: 'JWT प्रमाणीकरण',         kn: 'JWT ದೃಢೀಕರಣ' },
  };

  const t = (key) => T[key]?.[lang] || T[key]?.en || key;

  return (
    <div className="settings-page">
      <header className="page-header">
        <div>
          <h2 className="page-title">{t('settingsTitle')}</h2>
          <p className="page-subtitle">{t('configureSystem')}</p>
        </div>
        <button className="btn-primary" onClick={() => console.log('Saving:', settings)}>
          <Save size={16} /><span>{t('saveChanges')}</span>
        </button>
      </header>

      <div className="settings-grid">
        {/* Attendance Rules */}
        <div className="glass-panel settings-card">
          <div className="settings-card-header"><Clock size={20} className="settings-icon" /><h3>{t('attendanceRules')}</h3></div>
          <div className="settings-fields">
            <div className="field-row">
              <div className="field-info">
                <label>{t('lateThreshold')}</label>
                <p>{t('lateDesc')}</p>
              </div>
              <input type="number" min="1" max="30" value={settings.lateThreshold} onChange={e => update('lateThreshold', parseInt(e.target.value))} />
            </div>
            <div className="field-row">
              <div className="field-info">
                <label>{t('minAttendance')}</label>
                <p>{t('minAttDesc')}</p>
              </div>
              <input type="number" min="50" max="100" value={settings.minAttendance} onChange={e => update('minAttendance', parseInt(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Face Recognition */}
        <div className="glass-panel settings-card">
          <div className="settings-card-header"><Shield size={20} className="settings-icon" /><h3>{t('faceRecognition')}</h3></div>
          <div className="settings-fields">
            <div className="field-row">
              <div className="field-info">
                <label>{t('confidenceThreshold')}</label>
                <p>{t('confidenceDesc')}</p>
              </div>
              <input type="number" min="50" max="100" value={settings.confidenceThreshold} onChange={e => update('confidenceThreshold', parseInt(e.target.value))} />
            </div>
            <div className="field-row">
              <div className="field-info">
                <label>{t('livenessDetection')}</label>
                <p>{t('livenessDesc')}</p>
              </div>
              <Toggle enabled={settings.enableLiveness} onToggle={() => update('enableLiveness', !settings.enableLiveness)} />
            </div>
          </div>
        </div>

        {/* Geo-Fencing */}
        <div className="glass-panel settings-card">
          <div className="settings-card-header"><MapPin size={20} className="settings-icon" /><h3>{t('geoFencing')}</h3></div>
          <div className="settings-fields">
            <div className="field-row">
              <div className="field-info">
                <label>{t('enableGeoFence')}</label>
                <p>{t('geoFenceDesc')}</p>
              </div>
              <Toggle enabled={settings.enableGeoFence} onToggle={() => update('enableGeoFence', !settings.enableGeoFence)} />
            </div>
            <div className="field-row">
              <div className="field-info">
                <label>{t('campusCoords')}</label>
                <p>{t('coordsDesc')}</p>
              </div>
              <div className="coord-inputs">
                <input type="text" placeholder="Lat" value={settings.campusLat} onChange={e => update('campusLat', e.target.value)} />
                <input type="text" placeholder="Lng" value={settings.campusLng} onChange={e => update('campusLng', e.target.value)} />
              </div>
            </div>
            <div className="field-row">
              <div className="field-info">
                <label>{t('allowedRadius')}</label>
                <p>{t('radiusDesc')}</p>
              </div>
              <input type="number" min="50" max="5000" value={settings.geoRadius} onChange={e => update('geoRadius', parseInt(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-panel settings-card">
          <div className="settings-card-header"><Bell size={20} className="settings-icon" /><h3>{t('notifications')}</h3></div>
          <div className="settings-fields">
            <div className="field-row">
              <div className="field-info"><label>{t('enableNotif')}</label><p>{t('enableNotifDesc')}</p></div>
              <Toggle enabled={settings.enableNotifications} onToggle={() => update('enableNotifications', !settings.enableNotifications)} />
            </div>
            <div className="field-row">
              <div className="field-info"><label>{t('smsNotif')}</label><p>{t('smsDesc')}</p></div>
              <Toggle enabled={settings.enableSMS} onToggle={() => update('enableSMS', !settings.enableSMS)} />
            </div>
            <div className="field-row">
              <div className="field-info"><label>{t('emailNotif')}</label><p>{t('emailDesc')}</p></div>
              <Toggle enabled={settings.enableEmail} onToggle={() => update('enableEmail', !settings.enableEmail)} />
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="glass-panel settings-card full-width">
          <div className="settings-card-header"><Server size={20} className="settings-icon" /><h3>{t('systemStatus')}</h3></div>
          <div className="system-status-grid">
            <div className="status-item"><Database size={18} /><div className="status-info"><span className="status-name">MongoDB</span><span className="status-value connected">{t('connected')}</span></div></div>
            <div className="status-item"><Globe size={18} /><div className="status-info"><span className="status-name">{t('apiServer')}</span><span className="status-value connected">{t('running')}</span></div></div>
            <div className="status-item"><Smartphone size={18} /><div className="status-info"><span className="status-name">{t('mobileApp')}</span><span className="status-value pending">{t('notConnected')}</span></div></div>
            <div className="status-item"><Key size={18} /><div className="status-info"><span className="status-name">{t('jwtAuth')}</span><span className="status-value connected">{t('active')}</span></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
