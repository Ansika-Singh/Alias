import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users, UserCheck, UserX, Clock, Download, TrendingUp,
  BookOpen, FlaskConical, FileText, Megaphone, Search,
  CheckCircle, XCircle, AlertCircle, Plus, Edit3,
  BarChart2, CalendarDays, MessageSquare, CreditCard, ShieldAlert
} from 'lucide-react';
import StatCard from '../components/StatCard';
import AttendanceTable from '../components/AttendanceTable';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import VoiceAssistant from '../components/VoiceAssistant';
import CampusCalendar from '../components/CampusCalendar';
import { get } from '../utils/api';
import './Dashboard.css';

const MOCK_STATS = [
  { title: "Total Enrolled", value: "248", icon: Users, trend: 0 },
  { title: "Present Today", value: "211", icon: UserCheck, trend: 1.5 },
  { title: "Absent Today", value: "37", icon: UserX, trend: -0.5 },
  { title: "Late Arrivals", value: "9", icon: Clock, trend: 0.2 },
];

const MOCK_CHART_DATA = [
  { name: 'W1', attendance: 78 },
  { name: 'W2', attendance: 82 },
  { name: 'W3', attendance: 75 },
  { name: 'W4', attendance: 88 },
  { name: 'W5', attendance: 84 },
  { name: 'W6', attendance: 91 },
  { name: 'W7', attendance: 86 },
  { name: 'W8', attendance: 89 },
];

const MOCK_ATTENDANCE = [
  { name: "Alex Johnson", usn: "1XX22CS001", subject: "Distributed Systems", timeIn: "09:05 AM", duration: 55, status: "PRESENT" },
  { name: "Siddharth Smith", usn: "1XX22CS042", subject: "Machine Learning", timeIn: "09:12 AM", duration: 48, status: "LATE" },
  { name: "Michael Chang", usn: "1XX22CS088", subject: "Distributed Systems", timeIn: "--", duration: 0, status: "ABSENT" },
  { name: "Pranav Patel", usn: "1XX22CS102", subject: "Software Eng.", timeIn: "10:00 AM", duration: 60, status: "PRESENT" },
  { name: "Rahul Sharma", usn: "1XX22CS099", subject: "Software Eng.", timeIn: "10:02 AM", duration: 58, status: "PRESENT" },
];

const TEACHER_DATA = {
  assignments: [
    { id: 1, title: 'MapReduce Implementation', course: 'CS501', due: '2026-05-18', submitted: 38, total: 50 },
    { id: 2, title: 'Neural Network Report', course: 'CS502', due: '2026-05-21', submitted: 45, total: 50 },
    { id: 3, title: 'Design Patterns Quiz', course: 'CS503', due: '2026-05-19', submitted: 22, total: 50 },
  ],
  labs: [
    { id: 1, name: 'Computer Networks Lab', section: 'A', reports: 48, pending: 6 },
    { id: 2, name: 'Machine Learning Lab', section: 'A', reports: 44, pending: 0 },
    { id: 3, name: 'Distributed Systems Lab', section: 'B', reports: 30, pending: 12 },
  ],
  exams: [
    { subject: 'Distributed Systems', date: '2026-05-20', time: '10:00 AM', room: 'LH-301', invigilator: 'Dr. Wilson' },
    { subject: 'Machine Learning', date: '2026-05-22', time: '02:00 PM', room: 'LH-102', invigilator: 'Prof. Chen' },
    { subject: 'Software Engineering', date: '2026-05-25', time: '10:00 AM', room: 'Lab-4', invigilator: 'Dr. Rodriguez' },
  ],
  announcements: [
    { id: 1, title: 'End Semester Exam Schedule', date: '2026-05-15', category: 'Exam', by: 'Principal', status: 'Published' },
    { id: 2, title: 'Google Placement Drive', date: '2026-05-18', category: 'Placement', by: 'Dr. Chen', status: 'Published' },
    { id: 3, title: 'Faculty Meeting — Thursday', date: '2026-05-16', category: 'Admin', by: 'HOD', status: 'Draft' },
  ],
  grievances: [
    { id: 'GRV-001', student: 'Ansika Singh', usn: '1XX22CS042', issue: 'WiFi not working in Library', date: '2026-05-14', status: 'Open' },
    { id: 'GRV-002', student: 'Rahul Sharma', usn: '1XX22CS099', issue: 'Lab attendance marked wrong on 12 May', date: '2026-05-12', status: 'In Review' },
    { id: 'GRV-003', student: 'Michael Chang', usn: '1XX22CS088', issue: 'Hostel water supply issue', date: '2026-05-10', status: 'Resolved' },
  ],
  students: [
    { name: 'Ansika Singh', usn: '1XX22CS042', branch: 'CSE', sem: 6, attendance: 82, gpa: 9.2 },
    { name: 'Rahul Sharma', usn: '1XX22CS099', branch: 'CSE', sem: 6, attendance: 74, gpa: 8.1 },
    { name: 'Michael Chang', usn: '1XX22CS088', branch: 'CSE', sem: 6, attendance: 68, gpa: 7.5 },
    { name: 'Pranav Patel', usn: '1XX22CS102', branch: 'ISE', sem: 6, attendance: 91, gpa: 9.8 },
    { name: 'Alex Johnson', usn: '1XX22CS001', branch: 'CSE', sem: 6, attendance: 88, gpa: 9.0 },
  ],
  feeDefaulters: [
    { name: 'Michael Chang', usn: '1XX22CS088', due: 50000 },
    { name: 'Rahul Sharma', usn: '1XX22CS099', due: 25000 },
    { name: 'Siddharth Smith', usn: '1XX22CS042', due: 75000 },
  ],
  events: [
    { date: '2026-05-18', title: 'Tech Symposium', type: 'event' },
    { date: '2026-05-21', title: 'Cultural Fest', type: 'event' },
    { date: '2026-05-24', title: 'Sunday', type: 'holiday' },
    { date: '2026-05-26', title: 'Buddha Purnima', type: 'festival' },
  ],
  sectionStats: [
    { name: 'CS-A', present: 45, absent: 5 },
    { name: 'CS-B', present: 38, absent: 12 },
    { name: 'ISE-A', present: 42, absent: 8 },
    { name: 'ECE-A', present: 44, absent: 6 },
  ]
};

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const MOCK_STATS = [
    { title: t('totalEnrolled'), value: "248", icon: Users, trend: 0 },
    { title: t('presentToday'), value: "211", icon: UserCheck, trend: 1.5 },
    { title: t('absentToday'), value: "37", icon: UserX, trend: -0.5 },
    { title: t('lateArrivals'), value: "9", icon: Clock, trend: 0.2 },
  ];
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(MOCK_STATS);
  const [chartData, setChartData] = useState(MOCK_CHART_DATA);
  const [attendance, setAttendance] = useState(MOCK_ATTENDANCE);
  const [riskAlert, setRiskAlert] = useState(
    lang === 'hi' ? '3 छात्र 75% से कम उपस्थिति के साथ जोखिम में हैं।' :
    lang === 'kn' ? '3 ವಿದ್ಯಾರ್ಥಿಗಳು 75% ಕ್ಕಿಂತ ಕಡಿಮೆ ಹಾಜರಾತಿಯೊಂದಿಗೆ ಅಪಾಯದಲ್ಲಿದ್ದಾರೆ.' :
    '3 students are currently at risk with attendance below 75%.'
  );
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', category: 'General', body: '' });

  const userRole = localStorage.getItem('userRole') || 'teacher';
  const isPrincipal = userRole === 'principal';
  const userName = localStorage.getItem('userName') || (isPrincipal ? 'Principal' : 'Teacher');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await get('/analytics/dashboard');
        const statsData = await statsRes.json();
        if (statsData.code === 200) {
          const s = statsData.data;
          setStats([
            { title: t('totalEnrolled'), value: s.total_enrolled.toString(), icon: Users, trend: 0 },
            { title: t('presentToday'), value: s.present_today.toString(), icon: UserCheck, trend: 1.5 },
            { title: t('absentToday'), value: s.absent_today.toString(), icon: UserX, trend: -0.5 },
            { title: t('lateArrivals'), value: s.late_today.toString(), icon: Clock, trend: 0.2 },
          ]);
        }
        const trendsRes = await get('/analytics/trends/A/6');
        const trendsData = await trendsRes.json();
        if (trendsData.code === 200) {
          setChartData(trendsData.data.map(w => ({ name: w.week, attendance: w.percentage })));
        }
        const logsRes = await get('/attendance/', { limit: 10 });
        const logsData = await logsRes.json();
        if (logsData.code === 200) setAttendance(logsData.data);
        const summaryRes = await get('/analytics/summary/A/6');
        const summaryData = await summaryRes.json();
        if (summaryData.code === 200 && summaryData.data.at_risk_count > 0) {
          const count = summaryData.data.at_risk_count;
          setRiskAlert(
            lang === 'hi' ? `${count} छात्र 75% से कम उपस्थिति के साथ जोखिम में हैं।` :
            lang === 'kn' ? `${count} ವಿದ್ಯಾರ್ಥಿಗಳು 75% ಕ್ಕಿಂತ ಕಡಿಮೆ ಹಾಜರಾತಿಯೊಂದಿಗೆ ಅಪಾಯದಲ್ಲಿದ್ದಾರೆ.` :
            `${count} students at risk below 75%.`
          );
        }
      } catch { /* use mock data */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filteredStudents = TEACHER_DATA.students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.usn.toLowerCase().includes(studentSearch.toLowerCase())
  );

  if (loading) return null;

  return (
    <div className="dashboard-container">
      <header className="dash-header">
        <div>
          <div className="role-badge">{isPrincipal ? '👑 Principal' : '🏫 Teacher'}</div>
          <h2>{t('dashboard')}</h2>
          <p>Welcome back, {userName} — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="btn-primary export-btn" onClick={() => window.open('/api/attendance/export', '_blank')}>
          <Download size={18} /> {t('exportToExcel')}
        </button>
      </header>

      <nav className="dash-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><BarChart2 size={16} /> {t('overview')}</button>
        <button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}><UserCheck size={16} /> {t('attendance')}</button>
        <button className={activeTab === 'academics' ? 'active' : ''} onClick={() => setActiveTab('academics')}><BookOpen size={16} /> {t('academics')}</button>
        <button className={activeTab === 'announcements' ? 'active' : ''} onClick={() => setActiveTab('announcements')}><Megaphone size={16} /> {t('announcements')}</button>
        <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}><Users size={16} /> {t('students')}</button>
        {isPrincipal && (
          <button className={activeTab === 'admin' ? 'active' : ''} onClick={() => setActiveTab('admin')}><ShieldAlert size={16} /> {t('admin')}</button>
        )}
      </nav>

      {activeTab === 'overview' && (
        <div className="dash-content">
          {new Date().getDay() === 0 && (
            <div className="day-off-banner">
              🏖️ No college today — it's Sunday. Attendance figures will resume tomorrow.
            </div>
          )}
          <div className="stat-grid">
            {stats.map((stat, idx) => <StatCard key={idx} {...stat} />)}
          </div>

          <div className="chart-row">
            <div className="glass-panel chart-panel">
              <h3>{t('attendanceTrend')}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAttend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px' }} formatter={(v) => [`${v}%`, 'Attendance']} />
                  <Area type="monotone" dataKey="attendance" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorAttend)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-panel chart-panel">
              <h3>{t('sectionWise')}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={TEACHER_DATA.sectionStats} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px' }} />
                  <Bar dataKey="present" fill="#ec4899" radius={[6,6,0,0]} name="Present" />
                  <Bar dataKey="absent" fill="#fca5a5" radius={[6,6,0,0]} name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="alert-risk glass-panel">
            <AlertCircle size={20} className="risk-icon" />
            <div>
              <strong>{t('riskAlert')}:</strong> {riskAlert}
            </div>
            <button className="btn-secondary" onClick={() => setActiveTab('students')}>{t('viewStudents')}</button>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="dash-content">
          <div className="glass-panel">
            <div className="panel-header">
              <h3>{lang==='hi'?'उपस्थिति प्रबंधन':lang==='kn'?'ಹಾಜರಾತಿ ನಿರ್ವಹಣೆ':'Attendance Management'}</h3>
              <div className="panel-actions">
                <button className="btn-primary" onClick={() => window.open('/api/attendance/export', '_blank')}><Download size={16} /> {lang==='hi'?'निर्यात':lang==='kn'?'ರಫ್ತು':'Export'}</button>
              </div>
            </div>
            <AttendanceTable data={attendance} />
          </div>
          <div className="glass-panel">
            <h3>{lang==='hi'?'कैंपस इवेंट कैलेंडर':lang==='kn'?'ಕ್ಯಾಂಪಸ್ ಕ್ಯಾಲೆಂಡರ್':'Campus Events Calendar'}</h3>
            <CampusCalendar events={TEACHER_DATA.events} />
          </div>
        </div>
      )}

      {activeTab === 'academics' && (
        <div className="dash-content">
          <div className="glass-panel">
            <div className="panel-header">
              <h3>{lang==='hi'?'असाइनमेंट सबमिशन':lang==='kn'?'ಅಸೈನ್‌ಮೆಂಟ್ ಸಲ್ಲಿಕೆ':'Assignment Submissions'}</h3>
              <button className="btn-primary"><Plus size={16} /> {lang==='hi'?'असाइनमेंट जोड़ें':lang==='kn'?'ಅಸೈನ್‌ಮೆಂಟ್ ಸೇರಿಸಿ':'Add Assignment'}</button>
            </div>
            <table className="dash-table">
              <thead><tr>
                <th>{lang==='hi'?'असाइनमेंट':lang==='kn'?'ಅಸೈನ್‌ಮೆಂಟ್':'Assignment'}</th>
                <th>{lang==='hi'?'कोर्स':lang==='kn'?'ಕೋರ್ಸ್':'Course'}</th>
                <th>{lang==='hi'?'अंतिम तिथि':lang==='kn'?'ಕೊನೆ ದಿನಾಂಕ':'Due Date'}</th>
                <th>{lang==='hi'?'जमा':lang==='kn'?'ಸಲ್ಲಿಸಿದ':'Submitted'}</th>
                <th>{lang==='hi'?'प्रगति':lang==='kn'?'ಪ್ರಗತಿ':'Progress'}</th>
              </tr></thead>
              <tbody>
                {TEACHER_DATA.assignments.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.title}</strong></td>
                    <td>{a.course}</td><td>{a.due}</td>
                    <td>{a.submitted}/{a.total}</td>
                    <td><div className="mini-progress"><div style={{width:`${(a.submitted/a.total)*100}%`}}></div></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="two-col-grid">
            <div className="glass-panel">
              <div className="panel-header">
                <h3>{lang==='hi'?'लैब रिपोर्ट स्थिति':lang==='kn'?'ಲ್ಯಾಬ್ ವರದಿ ಸ್ಥಿತಿ':'Lab Report Status'}</h3>
                <FlaskConical size={20} />
              </div>
              {TEACHER_DATA.labs.map(lab => (
                <div key={lab.id} className="lab-mgmt-item">
                  <div><strong>{lab.name}</strong><span>{lang==='hi'?'सेक्शन':lang==='kn'?'ವಿಭಾಗ':'Section'} {lab.section}</span></div>
                  <div className="lab-counts">
                    <span className="count-done">{lab.reports} {lang==='hi'?'समीक्षित':lang==='kn'?'ಪರಿಶೀಲಿಸಲಾಗಿದೆ':'reviewed'}</span>
                    {lab.pending > 0 && <span className="count-pending">{lab.pending} {lang==='hi'?'लंबित':lang==='kn'?'ಬಾಕಿ':'pending'}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-panel">
              <div className="panel-header">
                <h3>{lang==='hi'?'परीक्षा कार्यक्रम':lang==='kn'?'ಪರೀಕ್ಷಾ ವೇಳಾಪಟ್ಟಿ':'Exam Schedule'}</h3>
                <button className="btn-primary"><Plus size={16} /> {lang==='hi'?'परीक्षा जोड़ें':lang==='kn'?'ಪರೀಕ್ಷೆ ಸೇರಿಸಿ':'Add Exam'}</button>
              </div>
              {TEACHER_DATA.exams.map((e, i) => (
                <div key={i} className="exam-mgmt-item">
                  <div>
                    <strong>{e.subject}</strong>
                    <span>{e.date} • {e.time} • {e.room}</span>
                    <span>{lang==='hi'?'परीक्षक':lang==='kn'?'ಪರೀಕ್ಷಕ':'Invigilator'}: {e.invigilator}</span>
                  </div>
                  <button className="btn-icon-sm"><Edit3 size={15} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="dash-content">
          <div className="glass-panel">
            <div className="panel-header">
              <h3>{lang==='hi'?'घोषणाएं और परिपत्र':lang==='kn'?'ಪ್ರಕಟಣೆಗಳು ಮತ್ತು ಸುತ್ತೋಲೆಗಳು':'Announcements & Circulars'}</h3>
              <button className="btn-primary" onClick={() => setShowAnnModal(true)}><Plus size={16} /> {lang==='hi'?'नई घोषणा':lang==='kn'?'ಹೊಸ ಪ್ರಕಟಣೆ':'New Announcement'}</button>
            </div>
            <table className="dash-table">
              <thead><tr>
                <th>{lang==='hi'?'शीर्षक':lang==='kn'?'ಶೀರ್ಷಿಕೆ':'Title'}</th>
                <th>{lang==='hi'?'श्रेणी':lang==='kn'?'ವರ್ಗ':'Category'}</th>
                <th>{lang==='hi'?'प्रकाशित':lang==='kn'?'ಪ್ರಕಟಿಸಿದವರು':'Published By'}</th>
                <th>{lang==='hi'?'दिनांक':lang==='kn'?'ದಿನಾಂಕ':'Date'}</th>
                <th>{lang==='hi'?'स्थिति':lang==='kn'?'ಸ್ಥಿತಿ':'Status'}</th>
              </tr></thead>
              <tbody>
                {TEACHER_DATA.announcements.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.title}</strong></td>
                    <td>{a.category}</td><td>{a.by}</td><td>{a.date}</td>
                    <td><span className={`dash-tag ${a.status === 'Published' ? 'published' : 'draft'}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="dash-content">
          <div className="glass-panel">
            <div className="panel-header">
              <h3>{lang==='hi'?'छात्र डेटाबेस':lang==='kn'?'ವಿದ್ಯಾರ್ಥಿ ಡೇಟಾಬೇಸ್':'Student Database'}</h3>
              <div className="search-bar-dash">
                <Search size={16} />
                <input type="text" placeholder={lang==='hi'?'नाम या USN से खोजें...':lang==='kn'?'ಹೆಸರು ಅಥವಾ USN ಮೂಲಕ ಹುಡುಕಿ...':'Search by name or USN...'} value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
              </div>
            </div>
            <table className="dash-table">
              <thead><tr>
                <th>{lang==='hi'?'नाम':lang==='kn'?'ಹೆಸರು':'Name'}</th>
                <th>USN</th>
                <th>{lang==='hi'?'शाखा':lang==='kn'?'ಶಾಖೆ':'Branch'}</th>
                <th>{lang==='hi'?'उपस्थिति':lang==='kn'?'ಹಾಜರಾತಿ':'Attendance'}</th>
                <th>GPA</th>
                <th>{lang==='hi'?'स्थिति':lang==='kn'?'ಸ್ಥಿತಿ':'Status'}</th>
              </tr></thead>
              <tbody>
                {filteredStudents.map((s, i) => (
                  <tr key={i}>
                    <td><strong>{s.name}</strong></td>
                    <td style={{fontFamily:'monospace',fontSize:'0.85rem'}}>{s.usn}</td>
                    <td>{s.branch}</td>
                    <td>
                      <div className="att-inline">
                        <div className="mini-progress"><div style={{width:`${s.attendance}%`, background: s.attendance < 75 ? '#ef4444' : '#ec4899'}}></div></div>
                        <span className={s.attendance < 75 ? 'at-risk' : ''}>{s.attendance}%</span>
                      </div>
                    </td>
                    <td>{s.gpa}</td>
                    <td><span className={`dash-tag ${s.attendance < 75 ? 'at-risk' : 'safe'}`}>{s.attendance < 75 ? (lang==='hi'?'जोखिम में':lang==='kn'?'ಅಪಾಯದಲ್ಲಿ':'At Risk') : (lang==='hi'?'अच्छा':lang==='kn'?'ಉತ್ತಮ':'Good')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="glass-panel">
            <div className="panel-header">
              <h3>{lang==='hi'?'शिकायत और सहायता':lang==='kn'?'ದೂರು ಮತ್ತು ಬೆಂಬಲ':'Grievance & Support Queue'}</h3>
              <MessageSquare size={20} />
            </div>
            <table className="dash-table">
              <thead><tr>
                <th>ID</th>
                <th>{lang==='hi'?'छात्र':lang==='kn'?'ವಿದ್ಯಾರ್ಥಿ':'Student'}</th>
                <th>{lang==='hi'?'समस्या':lang==='kn'?'ಸಮಸ್ಯೆ':'Issue'}</th>
                <th>{lang==='hi'?'दिनांक':lang==='kn'?'ದಿನಾಂಕ':'Date'}</th>
                <th>{lang==='hi'?'स्थिति':lang==='kn'?'ಸ್ಥಿತಿ':'Status'}</th>
                <th>{lang==='hi'?'कार्रवाई':lang==='kn'?'ಕ್ರಿಯೆ':'Action'}</th>
              </tr></thead>
              <tbody>
                {TEACHER_DATA.grievances.map(g => (
                  <tr key={g.id}>
                    <td style={{fontFamily:'monospace',fontSize:'0.8rem'}}>{g.id}</td>
                    <td><strong>{g.student}</strong><br /><small>{g.usn}</small></td>
                    <td style={{maxWidth:'220px',fontSize:'0.85rem'}}>{g.issue}</td>
                    <td>{g.date}</td>
                    <td><span className={`dash-tag ${g.status === 'Resolved' ? 'safe' : g.status === 'Open' ? 'at-risk' : 'review'}`}>{g.status}</span></td>
                    <td>{g.status !== 'Resolved' && <button className="btn-resolve"><CheckCircle size={15} /> {lang==='hi'?'हल करें':lang==='kn'?'ಪರಿಹರಿಸಿ':'Resolve'}</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isPrincipal && activeTab === 'admin' && (
        <div className="dash-content">
          <div className="stat-grid">
            <div className="glass-panel stat-summary">
              <span>{lang==='hi'?'कुल शुल्क संग्रह':lang==='kn'?'ಒಟ್ಟು ಶುಲ್ಕ ಸಂಗ್ರಹ':'Total Fee Collection'}</span>
              <h2>₹31,00,000</h2>
              <small>{lang==='hi'?'इस शैक्षणिक वर्ष':lang==='kn'?'ಈ ಶೈಕ್ಷಣಿಕ ವರ್ಷ':'This Academic Year'}</small>
            </div>
            <div className="glass-panel stat-summary">
              <span>{lang==='hi'?'बकाया राशि':lang==='kn'?'ಬಾಕಿ ಮೊತ್ತ':'Outstanding Dues'}</span>
              <h2 className="danger">₹4,50,000</h2>
              <small>{lang==='hi'?'18 छात्रों में':lang==='kn'?'18 ವಿದ್ಯಾರ್ಥಿಗಳಲ್ಲಿ':'Across 18 students'}</small>
            </div>
            <div className="glass-panel stat-summary">
              <span>{lang==='hi'?'पूर्ण भुगतान छात्र':lang==='kn'?'ಸಂಪೂರ್ಣ ಪಾವತಿ ವಿದ್ಯಾರ್ಥಿಗಳು':'Fully Paid Students'}</span>
              <h2 className="safe">230 / 248</h2>
              <small>92.7% {lang==='hi'?'निकासी दर':lang==='kn'?'ಕ್ಲಿಯರೆನ್ಸ್ ದರ':'clearance rate'}</small>
            </div>
          </div>
          <div className="glass-panel">
            <div className="panel-header">
              <h3>{lang==='hi'?'शुल्क बकायेदार सूची':lang==='kn'?'ಶುಲ್ಕ ಬಾಕಿದಾರರ ಪಟ್ಟಿ':'Fee Defaulters List'}</h3>
              <ShieldAlert size={20} className="risk-icon" />
            </div>
            <table className="dash-table">
              <thead><tr>
                <th>{lang==='hi'?'छात्र का नाम':lang==='kn'?'ವಿದ್ಯಾರ್ಥಿ ಹೆಸರು':'Student Name'}</th>
                <th>USN</th>
                <th>{lang==='hi'?'बकाया राशि':lang==='kn'?'ಬಾಕಿ ಮೊತ್ತ':'Outstanding Amount'}</th>
                <th>{lang==='hi'?'कार्रवाई':lang==='kn'?'ಕ್ರಿಯೆ':'Action'}</th>
              </tr></thead>
              <tbody>
                {TEACHER_DATA.feeDefaulters.map((f, i) => (
                  <tr key={i}>
                    <td><strong>{f.name}</strong></td>
                    <td style={{fontFamily:'monospace'}}>{f.usn}</td>
                    <td className="danger">₹{f.due.toLocaleString()}</td>
                    <td><button className="btn-secondary">{lang==='hi'?'अनुस्मारक भेजें':lang==='kn'?'ಜ್ಞಾಪನೆ ಕಳುಹಿಸಿ':'Send Reminder'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAnnModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <h2>{lang==='hi'?'नई घोषणा बनाएं':lang==='kn'?'ಹೊಸ ಪ್ರಕಟಣೆ ರಚಿಸಿ':'Create New Announcement'}</h2>
            <form onSubmit={e => { e.preventDefault(); alert(lang==='hi'?'घोषणा प्रकाशित!':lang==='kn'?'ಪ್ರಕಟಣೆ ಪ್ರಕಟಿಸಲಾಗಿದೆ!':'Announcement published!'); setShowAnnModal(false); }}>
              <div className="form-group">
                <label>{lang==='hi'?'शीर्षक':lang==='kn'?'ಶೀರ್ಷಿಕೆ':'Title'}</label>
                <input type="text" required value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})} placeholder={lang==='hi'?'घोषणा शीर्षक...':lang==='kn'?'ಪ್ರಕಟಣೆ ಶೀರ್ಷಿಕೆ...':'Announcement title...'} />
              </div>
              <div className="form-group">
                <label>{lang==='hi'?'श्रेणी':lang==='kn'?'ವರ್ಗ':'Category'}</label>
                <select value={newAnn.category} onChange={e => setNewAnn({...newAnn, category: e.target.value})}>
                  <option>General</option><option>Exam</option><option>Event</option>
                  <option>Placement</option><option>Holiday</option><option>Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>{lang==='hi'?'विवरण':lang==='kn'?'ವಿವರಣೆ':'Body / Description'}</label>
                <textarea rows={4} value={newAnn.body} onChange={e => setNewAnn({...newAnn, body: e.target.value})} placeholder={lang==='hi'?'घोषणा विवरण...':lang==='kn'?'ಪ್ರಕಟಣೆ ವಿವರಗಳು...':'Announcement details...'} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAnnModal(false)}>{lang==='hi'?'रद्द करें':lang==='kn'?'ರದ್ದು':'Cancel'}</button>
                <button type="submit" className="btn-primary">{lang==='hi'?'घोषणा प्रकाशित करें':lang==='kn'?'ಪ್ರಕಟಣೆ ಪ್ರಕಟಿಸಿ':'Publish Announcement'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <VoiceAssistant />
    </div>
  );
};

export default Dashboard;
