import React, { useState, useEffect } from 'react';
import {
  Users, Calendar, TrendingUp, FileText, Mail, Phone,
  AlertCircle, Clock, CheckCircle2, ChevronRight,
  MessageSquare, Award, Flame, BookOpen, CreditCard,
  CalendarDays, FlaskConical, Megaphone, Eye, GraduationCap, Languages,
  Download, Paperclip, BookMarked
} from 'lucide-react';
import './ParentPortal.css';
import HeatmapCalendar from '../components/HeatmapCalendar';
import CampusCalendar from '../components/CampusCalendar';
import { get, post, BASE_URL } from '../utils/api';
import { useTranslation } from 'react-i18next';

const ParentPortal = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '', type: 'Sick Leave' });
  const [leaveHistory, setLeaveHistory] = useState([
    { type: 'Medical Leave', start: 'May 10', end: 'May 12', status: 'Approved' },
    { type: 'Family Function', start: 'Jun 05', end: 'Jun 06', status: 'Pending' },
  ]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { i18n, t } = useTranslation();
  const lang = i18n.language;

  const PP = {
    parentView:   { en: 'Parent View — Read Only', hi: 'अभिभावक दृश्य — केवल पठन', kn: 'ಪೋಷಕರ ವೀಕ್ಷಣೆ — ಓದಲು ಮಾತ್ರ' },
    ward:         { en: 'Ward', hi: 'वार्ड', kn: 'ವಾರ್ಡ್' },
    sem:          { en: 'Sem', hi: 'सेम', kn: 'ಸೆಮ್' },
    dayStreak:    { en: 'Day Streak', hi: 'दिन की स्ट्रीक', kn: 'ದಿನದ ಸ್ಟ್ರೀಕ್' },
    points:       { en: 'Points', hi: 'अंक', kn: 'ಅಂಕಗಳು' },
    emailTeacher: { en: 'Email Teacher', hi: 'शिक्षक को ईमेल करें', kn: 'ಶಿಕ್ಷಕರಿಗೆ ಇಮೇಲ್ ಮಾಡಿ' },
    callAdmin:    { en: 'Call Admin', hi: 'एडमिन को कॉल करें', kn: 'ಆಡಳಿತಕ್ಕೆ ಕರೆ ಮಾಡಿ' },
    overview:     { en: 'Overview', hi: 'अवलोकन', kn: 'ಅವಲೋಕನ' },
    academics:    { en: 'Academics', hi: 'शैक्षणिक', kn: 'ಶೈಕ್ಷಣಿಕ' },
    campus:       { en: 'Campus', hi: 'कैंपस', kn: 'ಕ್ಯಾಂಪಸ್' },
    fees:         { en: 'Fees', hi: 'शुल्क', kn: 'ಶುಲ್ಕ' },
    leave:        { en: 'Leave', hi: 'छुट्टी', kn: 'ರಜೆ' },
    logout:       { en: 'Log Out', hi: 'लॉग आउट', kn: 'ಲಾಗ್ ಔಟ್' }
  };
  const s = (key) => PP[key]?.[lang] || PP[key]?.en || key;

  const studentUsn = localStorage.getItem('userEmail') || '1XX19CS001';

  const mockChildData = {
    student: { name: 'Ansika Singh', usn: '1XX22CS042', branch: 'CSE', semester: '6' },
    attendance: { percentage: 82, present: 98, total: 120 },
    gamification: { streakCount: 14, points: 1850, badges: ['Perfect Week', 'Early Bird', '30-Day Streak'] },
    recent_logs: [
      { date: '2026-05-15', subject: 'Distributed Systems', status: 'Present', time: '09:05 AM' },
      { date: '2026-05-15', subject: 'Machine Learning', status: 'Present', time: '11:00 AM' },
      { date: '2026-05-14', subject: 'Software Engineering', status: 'Absent', time: '--' },
      { date: '2026-05-14', subject: 'Digital Image Processing', status: 'Present', time: '02:05 PM' },
      { date: '2026-05-13', subject: 'Distributed Systems Lab', status: 'Present', time: '09:00 AM' },
    ]
  };

  const childExtras = {
    assignments: [
      { title: 'MapReduce Implementation', course: 'CS501', due: '2026-05-18', status: 'Pending' },
      { title: 'Neural Network Report', course: 'CS502', due: '2026-05-21', status: 'Submitted' },
      { title: 'Software Design Patterns', course: 'CS503', due: '2026-05-19', status: 'Pending' },
    ],
    labs: [
      { name: 'Computer Networks Lab', day: 'Tuesday', reports: 10, pending: 2 },
      { name: 'Machine Learning Lab', day: 'Friday', reports: 8, pending: 0 },
    ],
    exams: [
      { subject: 'Distributed Systems', date: '2026-05-20', time: '10:00 AM', room: 'LH-301' },
      { subject: 'Machine Learning', date: '2026-05-22', time: '02:00 PM', room: 'LH-102' },
    ],
    fees: { 
      total: 125000, 
      paid: 100000, 
      due: 25000,
      history: [
        { id: 'TXN_9912', amount: 50000, date: '2025-08-10', status: 'Success' },
        { id: 'TXN_8821', amount: 50000, date: '2026-01-15', status: 'Success' },
        { id: 'TXN_7734', amount: 5000, date: '2026-02-20', status: 'Success' },
      ]
    },
    documents: [
      { name: '10th Marksheet', type: 'PDF', size: '1.2 MB' },
      { name: '12th Marksheet', type: 'PDF', size: '1.5 MB' },
      { name: 'Entrance Rank Card', type: 'PDF', size: '0.8 MB' },
      { name: 'Aadhar Card', type: 'PDF', size: '0.5 MB' },
    ],
    courses: [
      {
        id: 'CS501',
        name: 'Distributed Systems',
        instructor: 'Dr. Sarah Wilson',
        syllabus: 'Evolution of Distributed Systems, System Models, Interprocess Communication, Remote Invocation, Indirect Communication, Naming, Time & Global States, Coordination, Transactions, Concurrency Control, Distributed File Systems.',
        notes: [
          { title: 'Lec 1: Intro to Distributed Systems', date: '2026-04-10' },
          { title: 'Lec 2: Remote Procedure Call (RPC)', date: '2026-04-15' },
          { title: 'Lec 3: Consistency & Replication', date: '2026-04-22' },
          { title: 'Unit 1 Question Bank', date: '2026-05-01' },
        ]
      },
      {
        id: 'CS502',
        name: 'Machine Learning',
        instructor: 'Prof. James Chen',
        syllabus: 'Introduction to ML, Supervised Learning, Linear Regression, Logistic Regression, Neural Networks, Backpropagation, Support Vector Machines, Unsupervised Learning, K-Means, PCA, Reinforcement Learning Basics.',
        notes: [
          { title: 'Neural Networks - Theory & Practice', date: '2026-04-20' },
          { title: 'SVM Kernel Methods', date: '2026-04-28' },
          { title: 'Mid-Sem Revision Guide', date: '2026-05-05' },
        ]
      },
      {
        id: 'CS503',
        name: 'Software Engineering',
        instructor: 'Dr. Elena Rodriguez',
        syllabus: 'Software Process Models, Agile & Scrum, Requirement Engineering, System Modeling with UML, Architectural Design, Software Testing Strategies, Project Management & Risk Analysis.',
        notes: [
          { title: 'Agile vs Waterfall – Comparison', date: '2026-05-05' },
          { title: 'Design Patterns (GoF 23)', date: '2026-05-12' },
          { title: 'Testing Strategies Cheat Sheet', date: '2026-05-14' },
        ]
      },
      {
        id: 'CS504',
        name: 'Digital Image Processing',
        instructor: 'Dr. Michael Brown',
        syllabus: 'Digital Image Fundamentals, Image Enhancement in Spatial Domain, Filtering in Frequency Domain, Image Restoration, Color Image Processing, Image Compression (JPEG), Morphological Processing.',
        notes: [
          { title: 'Spatial Filters & Convolution', date: '2026-04-18' },
          { title: 'JPEG Compression Steps', date: '2026-04-30' },
        ]
      }
    ],
    events: [
      { date: '2026-05-18', title: 'Tech Symposium', type: 'event' },
      { date: '2026-05-24', title: 'Sunday', type: 'holiday' },
      { date: '2026-05-26', title: 'Buddha Purnima', type: 'festival' },
    ],
    announcements: [
      { id: 1, title: 'End Semester Exam Schedule Out', date: '2026-05-15', category: 'Exam', priority: 'Critical' },
      { id: 2, title: 'Placement Drive: Google Inc.', date: '2026-05-18', category: 'Placement', priority: 'Critical' },
      { id: 3, title: 'Guest Lecture on Quantum Computing', date: '2026-05-17', category: 'Event', priority: 'Normal' },
    ],
    leaveHistory: [
      { type: 'Medical Leave', start: 'May 10', end: 'May 12', status: 'Approved' },
      { type: 'Family Function', start: 'Jun 05', end: 'Jun 06', status: 'Pending' },
    ]
  };

  const [assignmentsList, setAssignmentsList] = useState(childExtras.assignments);
  const [examsList, setExamsList] = useState(childExtras.exams);

  useEffect(() => {
    setSelectedCourse(childExtras.courses[0]);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await get(`/portal/${studentUsn}/dashboard`);
      const result = await response.json();
      if (result.code === 200) setData(result.data);
      else setData(mockChildData);
      
      const heatmapRes = await get(`/analytics/heatmap/${studentUsn}`);
      const heatmapResult = await heatmapRes.json();
      if (heatmapResult.code === 200) setHeatmapData(heatmapResult.data);

      try {
        const assignmentsRes = await get('/academics/assignments');
        const assignmentsResult = await assignmentsRes.json();
        if (assignmentsResult.code === 200 && assignmentsResult.data.length > 0) {
          setAssignmentsList(assignmentsResult.data);
        }
      } catch (err) {
        console.warn("Failed to fetch assignments:", err);
      }

      try {
        const examsRes = await get('/academics/exams');
        const examsResult = await examsRes.json();
        if (examsResult.code === 200 && examsResult.data.length > 0) {
          setExamsList(examsResult.data);
        }
      } catch (err) {
        console.warn("Failed to fetch exams:", err);
      }
    } catch { setData(mockChildData); }
    finally { setLoading(false); }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    const newLeave = {
      type: leaveForm.type,
      start: leaveForm.startDate.split('-').reverse().slice(0,2).join(' '), // Format date nicely for preview e.g. "17 May"
      end: leaveForm.endDate.split('-').reverse().slice(0,2).join(' '),
      status: 'Pending'
    };

    try {
      const response = await post('/leaves', { usn: studentUsn, ...leaveForm, status: 'PENDING' });
      if (response.ok) {
        alert('Leave request submitted!');
      } else {
        alert('Leave request submitted! (demo)');
      }
    } catch (err) {
      console.warn("Backend leave submit failed, using visual demo fallback:", err);
      alert('Leave request submitted! (demo)');
    } finally {
      setLeaveHistory(prev => [newLeave, ...prev]);
      setShowLeaveModal(false);
      setLeaveForm({ startDate: '', endDate: '', reason: '', type: 'Sick Leave' });
    }
  };

  const handleDownloadNote = (courseId, noteTitle) => {
    const token = localStorage.getItem('accessToken');
    const url = `${BASE_URL}/academics/download-note?course_id=${courseId}&title=${encodeURIComponent(noteTitle)}${token ? `&token=${token}` : ''}`;
    window.open(url, '_blank');
  };

  const handleDownloadReceipt = (txnId) => {
    const token = localStorage.getItem('accessToken');
    const url = `${BASE_URL}/portal/download-receipt/${txnId}?usn=${studentUsn}${token ? `&token=${token}` : ''}`;
    window.open(url, '_blank');
  };

  const handleDownloadDocument = (docName) => {
    const token = localStorage.getItem('accessToken');
    const url = `${BASE_URL}/portal/download-document?usn=${studentUsn}&doc_name=${encodeURIComponent(docName)}${token ? `&token=${token}` : ''}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="loading">Loading Parent Dashboard...</div>;

  return (
    <div className="parent-portal-container">
      <header className="parent-header">
        <div className="parent-user-info">
          <div className="parent-avatar"><Users size={28} /></div>
          <div>
            <div className="parent-label"><Eye size={14} /> {s('parentView')}</div>
            <h1>{s('ward')}: {data?.student?.name}</h1>
            <p>{data?.student?.usn} • {data?.student?.branch} • {s('sem')} {data?.student?.semester}</p>
          </div>
        </div>
        <div className="parent-actions">
          <div className="child-stat-pill"><Flame size={16} className="icon-streak" /><span>{data?.gamification?.streakCount || 0} {s('dayStreak')}</span></div>
          <div className="child-stat-pill"><Award size={16} className="icon-points" /><span>{data?.gamification?.points || 0} {s('points')}</span></div>
          <button className="btn-secondary"><Mail size={16} /> {s('emailTeacher')}</button>
          <button className="btn-secondary"><Phone size={16} /> {s('callAdmin')}</button>
          <div className="parent-lang-select">
            <Languages size={16} />
            <select
              value={i18n.language}
              onChange={(e) => { i18n.changeLanguage(e.target.value); localStorage.setItem('lang', e.target.value); }}
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
          <button className="parent-logout-btn" onClick={onLogout}>
            {s('logout')}
          </button>
        </div>
      </header>

      <nav className="portal-tabs scrollable-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><TrendingUp size={16} /> {s('overview')}</button>
        <button className={activeTab === 'academics' ? 'active' : ''} onClick={() => setActiveTab('academics')}><BookOpen size={16} /> {s('academics')}</button>
        <button className={activeTab === 'campus' ? 'active' : ''} onClick={() => setActiveTab('campus')}><CalendarDays size={16} /> {s('campus')}</button>
        <button className={activeTab === 'fees' ? 'active' : ''} onClick={() => setActiveTab('fees')}><CreditCard size={16} /> {s('fees')}</button>
        <button className={activeTab === 'leave' ? 'active' : ''} onClick={() => setActiveTab('leave')}><MessageSquare size={16} /> {s('leave')}</button>
      </nav>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="portal-grid">
            <div className="glass-card">
              <div className="card-header"><h3>Attendance Health</h3><TrendingUp size={20} /></div>
              <div className="att-display">
                <div className={`att-percent ${data?.attendance?.percentage < 75 ? 'danger' : 'safe'}`}>{data?.attendance?.percentage || 0}%</div>
                <div className="progress-bar-container">
                  <div className={`progress-bar ${data?.attendance?.percentage < 75 ? 'low' : ''}`} style={{ width: `${data?.attendance?.percentage || 0}%` }}></div>
                </div>
                <p>{data?.attendance?.percentage < 75 ? '⚠️ Below 75%. Action Required.' : '✅ Good standing. Keep it up!'}</p>
              </div>
              <div className="att-stats-row">
                <div><span>Present</span><strong>{data?.attendance?.present}</strong></div>
                <div><span>Absent</span><strong>{(data?.attendance?.total || 0) - (data?.attendance?.present || 0)}</strong></div>
                <div><span>Total</span><strong>{data?.attendance?.total}</strong></div>
              </div>
            </div>

            <div className="glass-card">
              <div className="card-header"><h3>Achievements</h3><Award size={20} /></div>
              <div className="parent-badges">
                {data?.gamification?.badges?.map((b, i) => (
                  <div key={i} className="p-badge"><CheckCircle2 size={18} />{b}</div>
                ))}
              </div>
            </div>

            <div className="glass-card full-width">
              <div className="card-header"><h3>Attendance Density Heatmap</h3><Calendar size={20} /></div>
              <HeatmapCalendar data={heatmapData} />
            </div>

            <div className="glass-card full-width">
              <div className="card-header"><h3>Recent Class Attendance</h3><Clock size={20} /></div>
              <div className="att-log-table">
                <div className="log-header"><span>Date</span><span>Subject</span><span>Time</span><span>Status</span></div>
                {data?.recent_logs?.map((log, i) => (
                  <div key={i} className="log-row">
                    <span>{log.date}</span><strong>{log.subject}</strong>
                    <span>{log.time || '09:00 AM'}</span>
                    <span className={`status-tag ${log.status.toLowerCase()}`}>{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academics' && (
          <div className="portal-grid">
            <div className="glass-card full-width">
              <div className="card-header"><h3>Assignments Overview <span className="read-only-tag">Read Only</span></h3><BookOpen size={20} /></div>
              <div className="parent-list">
                {assignmentsList.map((a, i) => (
                  <div key={i} className="parent-list-item">
                    <div><strong>{a.title}</strong><span>{a.course} • Due: {a.due}</span></div>
                    <span className={`status-tag ${a.status === 'Submitted' || a.submitted > 0 ? 'present' : 'absent'}`}>{a.status || (a.submitted > 0 ? 'Submitted' : 'Pending')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card">
              <div className="card-header"><h3>Lab Reports <span className="read-only-tag">Read Only</span></h3><FlaskConical size={20} /></div>
              {childExtras.labs.map((l, i) => (
                <div key={i} className="parent-list-item">
                  <div><strong>{l.name}</strong><span>Every {l.day}</span></div>
                  <span>{l.reports} done {l.pending > 0 && <span className="pending-tag">{l.pending} pending</span>}</span>
                </div>
              ))}
            </div>
            <div className="glass-card">
              <div className="card-header"><h3>Upcoming Exams <span className="read-only-tag">Read Only</span></h3><FileText size={20} /></div>
              {examsList.map((e, i) => (
                <div key={i} className="parent-list-item">
                  <div><strong>{e.subject}</strong><span>{e.date} • {e.time || 'TBD'} • {e.room || 'TBD'}</span></div>
                  <span className="status-tag upcoming">Upcoming</span>
                </div>
              ))}
            </div>
            {/* Course Materials & Syllabus */}
            <div className="glass-card courses-card full-width">
              <div className="card-header">
                <h3>Course Materials & Syllabus</h3>
                <BookOpen size={20} />
              </div>
              <div className="courses-grid-layout">
                <div className="courses-sidebar">
                  {childExtras.courses.map(course => (
                    <button key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
                        background: selectedCourse?.id === course.id ? 'var(--accent-primary)' : 'white',
                        color: selectedCourse?.id === course.id ? 'white' : 'var(--text-primary)',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        transition: 'all 0.2s'
                      }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.7 }}>{course.id}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, flex: 1 }}>{course.name}</span>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
                <div className="course-details-panel parent">
                  {selectedCourse ? (
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{selectedCourse.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '1.25rem' }}>👨‍🏫 {selectedCourse.instructor}</p>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Syllabus</h5>
                        <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>{selectedCourse.syllabus}</p>
                      </div>
                      <div>
                        <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Resources</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {selectedCourse.notes.map((note, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                                <FileText size={15} style={{ color: 'var(--accent-primary)' }} />
                                {note.title}
                              </div>
                              <button onClick={() => handleDownloadNote(selectedCourse.id, note.title)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}><Download size={16} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', opacity: 0.3 }}>
                      <BookOpen size={40} style={{ marginBottom: '1rem' }} />
                      <p>Select a course to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campus' && (
          <div className="portal-grid">
            <div className="glass-card full-width">
              <div className="card-header"><h3>Campus Calendar <span className="read-only-tag">Read Only</span></h3><CalendarDays size={20} /></div>
              <CampusCalendar events={childExtras.events} />
            </div>
            <div className="glass-card full-width">
              <div className="card-header"><h3>College Announcements <span className="read-only-tag">Read Only</span></h3><Megaphone size={20} /></div>
              <div className="ann-list">
                {childExtras.announcements.map(a => (
                  <div key={a.id} className="ann-parent-item">
                    <div className={`priority-line ${a.priority.toLowerCase()}`}></div>
                    <div><strong>{a.title}</strong><small>{a.date} • {a.category}</small></div>
                    <span className={`ann-tag ${a.priority.toLowerCase()}`}>{a.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="portal-grid">
            <div className="glass-card">
              <div className="card-header"><h3>Fee Status <span className="read-only-tag">Read Only</span></h3><CreditCard size={20} /></div>
              <div className="fee-summary">
                <div className="fee-row"><span>Total Fees</span><strong>₹{childExtras.fees.total.toLocaleString()}</strong></div>
                <div className="fee-row"><span>Paid</span><strong className="paid">₹{childExtras.fees.paid.toLocaleString()}</strong></div>
                <div className="fee-row"><span>Outstanding</span><strong className="due">₹{childExtras.fees.due.toLocaleString()}</strong></div>
              </div>
              <div className="progress-bar-container" style={{marginTop:'1rem'}}>
                <div className="progress-bar" style={{width:`${(childExtras.fees.paid/childExtras.fees.total)*100}%`}}></div>
              </div>
              <p style={{fontSize:'0.8rem',marginTop:'0.5rem',color:'var(--text-secondary)'}}>
                {Math.round((childExtras.fees.paid/childExtras.fees.total)*100)}% of annual fees paid
              </p>
              <div className="parent-readonly-notice"><Eye size={14} /> Contact the Admin Office to make fee payments</div>
              
              <div className="fee-history" style={{marginTop:'1.5rem'}}>
                 <h5 style={{color:'var(--text-primary)',fontWeight:700,fontSize:'0.9rem',marginBottom:'0.75rem'}}>Payment History</h5>
                 {childExtras.fees.history.map((txn, i) => (
                    <div key={i} className="portal-list-item-card">
                       <div className="txn-info" style={{display:'flex',flexDirection:'column'}}>
                          <strong style={{color:'var(--text-primary)',fontSize:'0.88rem'}}>₹{txn.amount.toLocaleString()}</strong>
                          <span style={{fontSize:'0.75rem',color:'var(--text-secondary)'}}>{txn.date} • {txn.id}</span>
                       </div>
                       <button onClick={() => handleDownloadReceipt(txn.id)} className="btn-icon"><Download size={16} /></button>
                    </div>
                 ))}
              </div>
            </div>
            <div className="glass-card">
              <div className="card-header"><h3>Ward Details</h3><GraduationCap size={20} /></div>
              <div className="child-id-card" style={{marginBottom:'1.5rem'}}>
                <div className="child-id-row"><span>Name</span><strong>{data?.student?.name}</strong></div>
                <div className="child-id-row"><span>USN</span><strong>{data?.student?.usn}</strong></div>
                <div className="child-id-row"><span>Branch</span><strong>{data?.student?.branch}</strong></div>
                <div className="child-id-row"><span>Semester</span><strong>{data?.student?.semester}</strong></div>
                <div className="child-id-row"><span>Batch</span><strong>2022–2026</strong></div>
              </div>
              
              <div className="fee-history">
                 <h5 style={{color:'var(--text-primary)',fontWeight:700,fontSize:'0.9rem',marginBottom:'0.75rem'}}>Academic Documents</h5>
                 {childExtras.documents.map((doc, i) => (
                    <div key={i} className="portal-list-item-card">
                       <div className="txn-info" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                          <Paperclip size={16} style={{color:'var(--accent-primary)'}} />
                          <div style={{display:'flex',flexDirection:'column'}}>
                            <strong style={{color:'var(--text-primary)',fontSize:'0.85rem'}}>{doc.name}</strong>
                            <span style={{fontSize:'0.75rem',color:'var(--text-secondary)'}}>{doc.size} • {doc.type}</span>
                          </div>
                       </div>
                       <button onClick={() => handleDownloadDocument(doc.name)} className="btn-icon"><Download size={16} /></button>
                    </div>
                 ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leave' && (
          <div className="portal-grid">
            <div className="glass-card full-width">
              <div className="card-header"><h3>Leave Management</h3><MessageSquare size={20} /></div>
              <div className="leave-section">
                <div className="leave-history">
                  <h5>Recent Leave Applications</h5>
                  {leaveHistory.map((l, i) => (
                    <div key={i} className="leave-item">
                      <div className="leave-info"><strong>{l.type}</strong><span>{l.start} — {l.end}</span></div>
                      <span className={`status-badge ${l.status.toLowerCase()}`}>{l.status}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" style={{marginTop:'1.5rem'}} onClick={() => setShowLeaveModal(true)}>
                  + Apply New Leave
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showLeaveModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <h2>Apply for Student Leave</h2>
            <form onSubmit={handleLeaveSubmit}>
              <div className="form-group">
                <label>Leave Type</label>
                <select value={leaveForm.type} onChange={e => setLeaveForm({...leaveForm, type: e.target.value})}>
                  <option>Sick Leave</option><option>Medical Emergency</option>
                  <option>Personal Reason</option><option>Others</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" required value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" required value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea placeholder="Detailed reason..." required value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentPortal;
