import React, { useState } from 'react';
import { Upload, Calendar, Clock, ChevronDown, BookOpen, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Timetable.css';
import { postMultipart } from '../utils/api';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const MOCK_TIMETABLE = {
  MONDAY: [
    { subject: 'Data Structures', teacherId: 'Dr. Ramesh', startTime: '09:00', endTime: '10:00', section: 'A', semester: 5 },
    { subject: 'Operating Systems', teacherId: 'Prof. Ananya', startTime: '10:00', endTime: '11:00', section: 'A', semester: 5 },
    { subject: 'Java', teacherId: 'Dr. Suresh', startTime: '11:15', endTime: '12:15', section: 'A', semester: 5 },
    { subject: 'Mathematics', teacherId: 'Prof. Meera', startTime: '12:15', endTime: '13:15', section: 'A', semester: 5 },
    { subject: 'Python', teacherId: 'Prof. Alan', startTime: '14:00', endTime: '15:00', section: 'A', semester: 5 },
    { subject: 'English', teacherId: 'Prof. Sarah', startTime: '15:00', endTime: '16:00', section: 'A', semester: 5 },
    { subject: 'Biology', teacherId: 'Dr. John', startTime: '16:00', endTime: '17:00', section: 'A', semester: 5 },
  ],
  TUESDAY: [
    { subject: 'C Language', teacherId: 'Dr. Smith', startTime: '09:00', endTime: '10:00', section: 'A', semester: 5 },
    { subject: 'Python', teacherId: 'Prof. Alan', startTime: '10:00', endTime: '11:00', section: 'A', semester: 5 },
    { subject: 'Operating Systems', teacherId: 'Prof. Ananya', startTime: '11:15', endTime: '12:15', section: 'A', semester: 5 },
    { subject: 'Data Structures', teacherId: 'Dr. Ramesh', startTime: '12:15', endTime: '13:15', section: 'A', semester: 5 },
    { subject: 'Biology', teacherId: 'Dr. John', startTime: '14:00', endTime: '15:00', section: 'A', semester: 5 },
    { subject: 'Mathematics', teacherId: 'Prof. Meera', startTime: '15:00', endTime: '16:00', section: 'A', semester: 5 },
    { subject: 'English', teacherId: 'Prof. Sarah', startTime: '16:00', endTime: '17:00', section: 'A', semester: 5 },
  ],
  WEDNESDAY: [
    { subject: 'Java', teacherId: 'Dr. Suresh', startTime: '09:00', endTime: '10:00', section: 'A', semester: 5 },
    { subject: 'C Language', teacherId: 'Dr. Smith', startTime: '10:00', endTime: '11:00', section: 'A', semester: 5 },
    { subject: 'Mathematics', teacherId: 'Prof. Meera', startTime: '11:15', endTime: '12:15', section: 'A', semester: 5 },
    { subject: 'English', teacherId: 'Prof. Sarah', startTime: '12:15', endTime: '13:15', section: 'A', semester: 5 },
    { subject: 'Operating Systems', teacherId: 'Prof. Ananya', startTime: '14:00', endTime: '15:00', section: 'A', semester: 5 },
    { subject: 'Python', teacherId: 'Prof. Alan', startTime: '15:00', endTime: '16:00', section: 'A', semester: 5 },
    { subject: 'Data Structures', teacherId: 'Dr. Ramesh', startTime: '16:00', endTime: '17:00', section: 'A', semester: 5 },
  ],
  THURSDAY: [
    { subject: 'English', teacherId: 'Prof. Sarah', startTime: '09:00', endTime: '10:00', section: 'A', semester: 5 },
    { subject: 'Mathematics', teacherId: 'Prof. Meera', startTime: '10:00', endTime: '11:00', section: 'A', semester: 5 },
    { subject: 'Biology', teacherId: 'Dr. John', startTime: '11:15', endTime: '12:15', section: 'A', semester: 5 },
    { subject: 'Java', teacherId: 'Dr. Suresh', startTime: '12:15', endTime: '13:15', section: 'A', semester: 5 },
    { subject: 'C Language', teacherId: 'Dr. Smith', startTime: '14:00', endTime: '15:00', section: 'A', semester: 5 },
    { subject: 'Operating Systems', teacherId: 'Prof. Ananya', startTime: '15:00', endTime: '16:00', section: 'A', semester: 5 },
    { subject: 'Python', teacherId: 'Prof. Alan', startTime: '16:00', endTime: '17:00', section: 'A', semester: 5 },
  ],
  FRIDAY: [
    { subject: 'Python', teacherId: 'Prof. Alan', startTime: '09:00', endTime: '10:00', section: 'A', semester: 5 },
    { subject: 'Java', teacherId: 'Dr. Suresh', startTime: '10:00', endTime: '11:00', section: 'A', semester: 5 },
    { subject: 'Data Structures', teacherId: 'Dr. Ramesh', startTime: '11:15', endTime: '12:15', section: 'A', semester: 5 },
    { subject: 'C Language', teacherId: 'Dr. Smith', startTime: '12:15', endTime: '13:15', section: 'A', semester: 5 },
    { subject: 'Mathematics', teacherId: 'Prof. Meera', startTime: '14:00', endTime: '15:00', section: 'A', semester: 5 },
    { subject: 'Biology', teacherId: 'Dr. John', startTime: '15:00', endTime: '16:00', section: 'A', semester: 5 },
    { subject: 'English', teacherId: 'Prof. Sarah', startTime: '16:00', endTime: '17:00', section: 'A', semester: 5 },
  ],
  SATURDAY: [
    { subject: 'Data Structures', teacherId: 'Dr. Ramesh', startTime: '09:00', endTime: '10:00', section: 'A', semester: 5 },
    { subject: 'Operating Systems', teacherId: 'Prof. Ananya', startTime: '10:00', endTime: '11:00', section: 'A', semester: 5 },
    { subject: 'Python', teacherId: 'Prof. Alan', startTime: '11:15', endTime: '12:15', section: 'A', semester: 5 },
    { subject: 'Java', teacherId: 'Dr. Suresh', startTime: '12:15', endTime: '13:15', section: 'A', semester: 5 },
    { subject: 'C Language', teacherId: 'Dr. Smith', startTime: '14:00', endTime: '15:00', section: 'A', semester: 5 },
    { subject: 'Mathematics', teacherId: 'Prof. Meera', startTime: '15:00', endTime: '16:00', section: 'A', semester: 5 },
    { subject: 'Extra-curricular', teacherId: 'Coordinator', startTime: '16:00', endTime: '17:00', section: 'A', semester: 5 },
  ],
};

const COLORS = [
  'rgba(139, 92, 246, 0.18)',
  'rgba(6, 182, 212, 0.18)',
  'rgba(16, 185, 129, 0.18)',
  'rgba(245, 158, 11, 0.18)',
  'rgba(239, 68, 68, 0.18)',
  'rgba(236, 72, 153, 0.18)',
  'rgba(99, 102, 241, 0.18)',
];

const BORDER_COLORS = [
  'rgba(139, 92, 246, 0.5)',
  'rgba(6, 182, 212, 0.5)',
  'rgba(16, 185, 129, 0.5)',
  'rgba(245, 158, 11, 0.5)',
  'rgba(239, 68, 68, 0.5)',
  'rgba(236, 72, 153, 0.5)',
  'rgba(99, 102, 241, 0.5)',
];

const getSubjectColor = (subject) => {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % COLORS.length;
  return { bg: COLORS[idx], border: BORDER_COLORS[idx] };
};

const Timetable = () => {
  const { t } = useTranslation();
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 0 : new Date().getDay() - 1] || 'MONDAY');
  const [filterSection, setFilterSection] = useState('A');

  // Day names translated
  const DAY_LABELS = {
    MONDAY:    { hi: 'सोमवार',    kn: 'ಸೋಮವಾರ',   en: 'Monday'    },
    TUESDAY:   { hi: 'मंगलवार',   kn: 'ಮಂಗಳವಾರ',  en: 'Tuesday'   },
    WEDNESDAY: { hi: 'बुधवार',    kn: 'ಬುಧವಾರ',   en: 'Wednesday' },
    THURSDAY:  { hi: 'गुरुवार',   kn: 'ಗುರುವಾರ',  en: 'Thursday'  },
    FRIDAY:    { hi: 'शुक्रवार',  kn: 'ಶುಕ್ರವಾರ', en: 'Friday'    },
    SATURDAY:  { hi: 'शनिवार',    kn: 'ಶನಿವಾರ',   en: 'Saturday'  },
  };

  const lang = localStorage.getItem('lang') || 'en';
  const getDayLabel = (day) => DAY_LABELS[day]?.[lang] || DAY_LABELS[day]?.en || day;
  const getDayShort = (day) => getDayLabel(day).slice(0, 3);

  // Fix today calculation
  const jsDay = new Date().getDay(); // 0=Sun,1=Mon,...,6=Sat
  const todayName = jsDay === 0 ? 'SATURDAY' : DAYS[jsDay - 1];
  const slots = MOCK_TIMETABLE[selectedDay] || [];

  return (
    <div className="timetable-page">
      <header className="page-header">
        <div>
          <h2 className="page-title">{t('timetableTitle')}</h2>
          <p className="page-subtitle">{t('manageSchedule')}</p>
        </div>
        <div className="header-actions">
          <div className="select-wrapper">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Section:</span>
            <select id="tt-filter-section" value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
          <label className="btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={16} />
            <span>{t('uploadExcel')}</span>
            <input 
              type="file" 
              accept=".xlsx" 
              hidden 
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const formData = new FormData();
                  formData.append('file', file);
                  try {
                    const response = await postMultipart('/timetable/upload', formData);
                    const result = await response.json();
                    if (result.code === 200) {
                      alert("Timetable uploaded successfully!");
                    } else {
                      alert(result.message);
                    }
                  } catch (err) {
                    alert("Upload failed: " + err.message);
                  }
                }
              }} 
            />
          </label>
        </div>
      </header>

      {/* Day Selector Tabs */}
      <div className="day-tabs glass-panel">
        {DAYS.map(day => (
          <button
            key={day}
            id={`day-tab-${day.toLowerCase()}`}
            className={`day-tab ${selectedDay === day ? 'active' : ''} ${todayName === day ? 'today' : ''}`}
            onClick={() => setSelectedDay(day)}
          >
            <span className="day-short">{getDayShort(day)}</span>
            <span className="day-full">{getDayLabel(day)}</span>
            {todayName === day && <span className="today-dot" />}
          </button>
        ))}
      </div>

      {/* Schedule Grid */}
      <div className="schedule-grid">
        {slots.length === 0 ? (
          <div className="glass-panel empty-state" style={{ gridColumn: '1 / -1' }}>
            <Calendar size={40} />
            <p>{lang === 'hi' ? `${getDayLabel(selectedDay)} के लिए कोई कक्षा निर्धारित नहीं।` : lang === 'kn' ? `${getDayLabel(selectedDay)} ಗೆ ತರಗತಿಗಳಿಲ್ಲ.` : `No classes scheduled for ${getDayLabel(selectedDay)}.`}</p>
          </div>
        ) : (
          slots.map((slot, idx) => {
            const color = getSubjectColor(slot.subject);
            return (
              <div key={idx} className="slot-card glass-panel" style={{ borderLeft: `3px solid ${color.border}` }}>
                <div className="slot-time-badge" style={{ background: color.bg }}>
                  <Clock size={14} />
                  <span>{slot.startTime} - {slot.endTime}</span>
                </div>
                <h3 className="slot-subject">{slot.subject}</h3>
                <div className="slot-meta">
                  <span className="slot-teacher">
                    <User size={14} />
                    {slot.teacherId}
                  </span>
                  <span className="slot-section">
                    <BookOpen size={14} />
                    {lang === 'hi' ? `सेम ${slot.semester} / सेक ${slot.section}` : lang === 'kn' ? `ಸೆಮ್ ${slot.semester} / ಸೆಕ್ ${slot.section}` : `Sem ${slot.semester} / Sec ${slot.section}`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Weekly Overview */}
      <div className="glass-panel weekly-overview">
        <h3 style={{ marginBottom: '1rem' }}>{lang === 'hi' ? 'साप्ताहिक अवलोकन' : lang === 'kn' ? 'ವಾರದ ಅವಲೋಕನ' : 'Weekly Overview'}</h3>
        <div className="week-grid">
          {DAYS.map(day => (
            <div key={day} className="week-col">
              <div className={`week-col-header ${todayName === day ? 'today' : ''}`}>
                {getDayShort(day)}
              </div>
              {(MOCK_TIMETABLE[day] || []).map((slot, idx) => {
                const color = getSubjectColor(slot.subject);
                return (
                  <div key={idx} className="week-slot" style={{ background: color.bg, borderLeft: `2px solid ${color.border}` }}>
                    <span className="week-slot-name">{slot.subject}</span>
                    <span className="week-slot-time">{slot.startTime}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timetable;
