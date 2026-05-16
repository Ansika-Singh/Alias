import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AttendanceTable = ({ data }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const labels = {
    studentName: { en: 'Student Name', hi: 'छात्र का नाम', kn: 'ವಿದ್ಯಾರ್ಥಿ ಹೆಸರು' },
    subject:     { en: 'Subject',      hi: 'विषय',         kn: 'ವಿಷಯ' },
    timeIn:      { en: 'Time In',      hi: 'प्रवेश समय',   kn: 'ಪ್ರವೇಶ ಸಮಯ' },
    duration:    { en: 'Duration',     hi: 'अवधि',         kn: 'ಅವಧಿ' },
    status:      { en: 'Status',       hi: 'स्थिति',       kn: 'ಸ್ಥಿತಿ' },
    mins:        { en: 'mins',         hi: 'मिनट',         kn: 'ನಿಮಿಷ' },
    showing:     { en: 'Showing',      hi: 'दिखा रहे हैं', kn: 'ತೋರಿಸಲಾಗುತ್ತಿದೆ' },
    to:          { en: 'to',           hi: 'से',           kn: 'ರಿಂದ' },
    of:          { en: 'of',           hi: 'में से',       kn: 'ರಲ್ಲಿ' },
    logs:        { en: 'logs',         hi: 'लॉग',          kn: 'ದಾಖಲೆಗಳು' },
    page:        { en: 'Page',         hi: 'पृष्ठ',        kn: 'ಪುಟ' },
    present:     { en: 'PRESENT',      hi: 'उपस्थित',      kn: 'ಹಾಜರು' },
    absent:      { en: 'ABSENT',       hi: 'अनुपस्थित',    kn: 'ಗೈರು' },
    late:        { en: 'LATE',         hi: 'देर से',       kn: 'ತಡ' },
  };

  const l = (key) => labels[key]?.[lang] || labels[key]?.en || key;

  const translateStatus = (status) => {
    if (status === 'PRESENT') return l('present');
    if (status === 'ABSENT') return l('absent');
    if (status === 'LATE') return l('late');
    return status;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>{l('studentName')}</th>
              <th>USN</th>
              <th>{l('subject')}</th>
              <th>{l('timeIn')}</th>
              <th>{l('duration')}</th>
              <th>{l('status')}</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 500 }}>{row.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{row.usn}</td>
                <td>{row.subject}</td>
                <td>{row.timeIn}</td>
                <td>{row.duration} {l('mins')}</td>
                <td>
                  <span className={`status-badge status-${row.status.toLowerCase()}`}>
                    {translateStatus(row.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {l('showing')} {startIndex + 1} {l('to')} {Math.min(startIndex + itemsPerPage, data.length)} {l('of')} {data.length} {l('logs')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn-icon" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '4px' }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: '0.9rem', minWidth: '80px', textAlign: 'center' }}>
            {l('page')} {currentPage} / {totalPages}
          </span>
          <button className="btn-icon" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '4px' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;
