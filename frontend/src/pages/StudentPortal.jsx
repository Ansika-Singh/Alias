import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Flame, 
  HelpCircle,
  ChevronRight,
  BookOpen,
  FileText,
  MessageSquare,
  Trophy,
  Languages,
  Download,
  CalendarDays,
  ListTodo,
  FlaskConical,
  Megaphone,
  Users,
  BookMarked,
  CreditCard,
  User,
  Badge,
  Home,
  Upload,
  Settings,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Paperclip,
  ExternalLink,
  ShieldCheck,
  Mail,
  Phone,
  QrCode
} from 'lucide-react';
import './StudentPortal.css';
import './QRScanner.css';
import HeatmapCalendar from '../components/HeatmapCalendar';
import CampusCalendar from '../components/CampusCalendar';
import QRScanner from './QRScanner';
import { apiFetch, get, post } from '../utils/api';
import { useTranslation } from 'react-i18next';

const StudentPortal = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [facultySearch, setFacultySearch] = useState('');
  const { i18n, t } = useTranslation();
  const lang = i18n.language;

  // Translation map for StudentPortal
  const SP = {
    overview:     { en: 'Overview',      hi: 'अवलोकन',        kn: 'ಅವಲೋಕನ' },
    academics:    { en: 'Academics',     hi: 'शैक्षणिक',      kn: 'ಶೈಕ್ಷಣಿಕ' },
    campus:       { en: 'Campus',        hi: 'कैंपस',         kn: 'ಕ್ಯಾಂಪಸ್' },
    admin:        { en: 'Admin',         hi: 'प्रशासन',       kn: 'ಆಡಳಿತ' },
    profile:      { en: 'Profile',       hi: 'प्रोफ़ाइल',     kn: 'ಪ್ರೊಫೈಲ್' },
    scanQR:       { en: 'Scan QR',       hi: 'QR स्कैन',      kn: 'QR ಸ್ಕ್ಯಾನ್' },
    attendance:   { en: 'Attendance',    hi: 'उपस्थिति',      kn: 'ಹಾಜರಾತಿ' },
    assignments:  { en: 'Assignments',   hi: 'असाइनमेंट',     kn: 'ಅಸೈನ್‌ಮೆಂಟ್' },
    labReports:   { en: 'Lab Reports & Submissions', hi: 'लैब रिपोर्ट और सबमिशन', kn: 'ಲ್ಯಾಬ್ ವರದಿ ಮತ್ತು ಸಲ್ಲಿಕೆ' },
    examsResults: { en: 'Exams & Results', hi: 'परीक्षा और परिणाम', kn: 'ಪರೀಕ್ಷೆ ಮತ್ತು ಫಲಿತಾಂಶ' },
    upcoming:     { en: 'UPCOMING',      hi: 'आगामी',         kn: 'ಮುಂಬರುವ' },
    pastResults:  { en: 'PAST RESULTS',  hi: 'पिछले परिणाम',  kn: 'ಹಿಂದಿನ ಫಲಿತಾಂಶ' },
    courseMat:    { en: 'Course Materials & Syllabus', hi: 'कोर्स सामग्री और पाठ्यक्रम', kn: 'ಕೋರ್ಸ್ ಸಾಮಗ್ರಿ ಮತ್ತು ಪಠ್ಯಕ್ರಮ' },
    done:         { en: 'Done',          hi: 'पूर्ण',         kn: 'ಮುಗಿದಿದೆ' },
    pending:      { en: 'Pending',       hi: 'लंबित',         kn: 'ಬಾಕಿ' },
    everyDay:     { en: 'Every',         hi: 'हर',            kn: 'ಪ್ರತಿ' },
    syllabus:     { en: 'Syllabus',      hi: 'पाठ्यक्रम',     kn: 'ಪಠ್ಯಕ್ರಮ' },
    resources:    { en: 'Resources',     hi: 'संसाधन',        kn: 'ಸಂಪನ್ಮೂಲಗಳು' },
    instructor:   { en: 'Instructor',    hi: 'प्रशिक्षक',     kn: 'ಬೋಧಕ' },
    selectCourse: { en: 'Select a course to view details', hi: 'विवरण देखने के लिए कोर्स चुनें', kn: 'ವಿವರಗಳನ್ನು ನೋಡಲು ಕೋರ್ಸ್ ಆಯ್ಕೆ ಮಾಡಿ' },
    dayStreak:    { en: 'Day Streak',    hi: 'दिन की स्ट्रीक', kn: 'ದಿನದ ಸ್ಟ್ರೀಕ್' },
    points:       { en: 'Points',        hi: 'अंक',           kn: 'ಅಂಕಗಳು' },
    welcomeBack:  { en: 'Welcome',       hi: 'स्वागत है',     kn: 'ಸ್ವಾಗತ' },
    sem:          { en: 'Sem',           hi: 'सेम',           kn: 'ಸೆಮ್' },
  };
  const s = (key) => SP[key]?.[lang] || SP[key]?.en || key;
  
  const [disputeForm, setDisputeForm] = useState({
    type: 'attendance',
    date: '',
    subject: '',
    reason: ''
  });

  const usn = localStorage.getItem('userEmail') || '1XX19CS001';

  // Sample Portal Data
  const portalData = {
    exams: [
      { id: 1, subject: 'Distributed Systems', date: '2026-05-20', time: '10:00 AM', room: 'LH-301', status: 'Upcoming' },
      { id: 2, subject: 'Machine Learning', date: '2026-05-22', time: '02:00 PM', room: 'LH-102', status: 'Upcoming' },
      { id: 3, subject: 'Software Engineering', date: '2026-05-25', time: '10:00 AM', room: 'Lab-4', status: 'Upcoming' },
      { id: 4, subject: 'Digital Image Processing', date: '2026-05-28', time: '10:00 AM', room: 'LH-205', status: 'Upcoming' },
    ],
    results: [
      { subject: 'Operating Systems', grade: 'A+', marks: '92/100', semester: '5', gpa: '9.5' },
      { subject: 'Computer Networks', grade: 'A', marks: '88/100', semester: '5', gpa: '9.0' },
      { subject: 'Database Management', grade: 'O', marks: '95/100', semester: '5', gpa: '10.0' },
      { subject: 'Theory of Computation', grade: 'B+', marks: '78/100', semester: '5', gpa: '8.0' },
      { subject: 'Microprocessors', grade: 'A', marks: '85/100', semester: '4', gpa: '9.0' },
    ],
    assignments: [
      { id: 1, title: 'MapReduce Implementation', course: 'CS501', due: '2026-05-18', status: 'Pending', priority: 'High' },
      { id: 2, title: 'Neural Network Project Report', course: 'CS502', due: '2026-05-21', status: 'Submitted', priority: 'Medium' },
      { id: 3, title: 'Software Design Patterns Quiz', course: 'CS503', due: '2026-05-19', status: 'Pending', priority: 'Low' },
      { id: 4, title: 'Distributed Hashing Lab', course: 'CS501', due: '2026-05-24', status: 'Pending', priority: 'Medium' },
      { id: 5, title: 'Agile Methodology Case Study', course: 'CS503', due: '2026-05-12', status: 'Submitted', priority: 'High' },
    ],
    projects: [
      { id: 1, name: 'Smart Attendance System', phase: 'Development', progress: 65, team: 'Solo' },
      { id: 2, name: 'E-Commerce Platform', phase: 'Testing', progress: 90, team: 'Group 4' },
      { id: 3, name: 'Real-time Chat App', phase: 'Planning', progress: 15, team: 'Group 2' },
    ],
    labs: [
      { id: 1, name: 'Computer Networks Lab', day: 'Tuesday', reports: 10, pending: 2 },
      { id: 2, name: 'Machine Learning Lab', day: 'Friday', reports: 8, pending: 0 },
      { id: 3, name: 'Distributed Systems Lab', day: 'Monday', reports: 5, pending: 3 },
    ],
    announcements: [
      { id: 1, title: 'End Semester Exam Schedule Out', date: '2026-05-15', category: 'Exam', priority: 'Critical' },
      { id: 2, title: 'Guest Lecture on Quantum Computing', date: '2026-05-17', category: 'Event', priority: 'Normal' },
      { id: 3, title: 'Hostel Outing Permitted for Sunday', date: '2026-05-14', category: 'Admin', priority: 'Low' },
      { id: 4, title: 'Placement Drive: Google Inc.', date: '2026-05-18', category: 'Placement', priority: 'Critical' },
      { id: 5, title: 'Inter-College Hackathon Registration', date: '2026-05-10', category: 'Event', priority: 'Normal' },
    ],
    faculty: [
      { name: 'Dr. Sarah Wilson', dept: 'CSE', role: 'Associate Prof.', email: 'sarah.w@college.edu', image: 'SW' },
      { name: 'Prof. James Chen', dept: 'CSE', role: 'Head of Dept.', email: 'james.c@college.edu', image: 'JC' },
      { name: 'Dr. Elena Rodriguez', dept: 'ISE', role: 'Asst. Prof.', email: 'elena.r@college.edu', image: 'ER' },
      { name: 'Dr. Michael Brown', dept: 'CSE', role: 'Professor', email: 'michael.b@college.edu', image: 'MB' },
      { name: 'Ms. Emily Davis', dept: 'Mathematics', role: 'Lecturer', email: 'emily.d@college.edu', image: 'ED' },
    ],
    events: [
      { date: '2026-05-18', title: 'Tech Symposium', type: 'event' },
      { date: '2026-05-21', title: 'Cultural Fest', type: 'event' },
      { date: '2026-05-24', title: 'Sunday', type: 'holiday' },
      { date: '2026-05-26', title: 'Buddha Purnima', type: 'festival' },
      { date: '2026-05-31', title: 'Sunday', type: 'holiday' },
      { date: '2026-05-10', title: 'Mother\'s Day', type: 'event' },
      { date: '2026-05-01', title: 'Labor Day', type: 'holiday' },
    ],
    library: {
      cardNo: 'LIB-2026-0992',
      booksBorrowed: [
        { title: 'Distributed Systems: Principles', due: '2026-05-25', status: 'Active' },
        { title: 'Clean Code', due: '2026-05-12', status: 'Overdue' },
        { title: 'Introduction to Algorithms', due: '2026-06-01', status: 'Active' },
      ],
      fine: 45.00
    },
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
    profile: {
      personal: {
        dob: '2004-05-15',
        phone: '+91 98765 43210',
        email: 'student@college.edu',
        address: '123, Campus Heights, Bangalore'
      },
      family: {
        father: 'Robert Smith',
        mother: 'Jane Smith',
        emergency: '+91 99999 88888'
      },
      documents: [
        { name: '10th Marksheet', type: 'PDF', size: '1.2 MB' },
        { name: '12th Marksheet', type: 'PDF', size: '1.5 MB' },
        { name: 'Entrance Rank Card', type: 'PDF', size: '0.8 MB' },
        { name: 'Profile Photo', type: 'JPG', size: '2.4 MB' },
        { name: 'Aadhar Card', type: 'PDF', size: '0.5 MB' },
      ]
    },
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
    ]
  };

  const [assignmentsList, setAssignmentsList] = useState(portalData.assignments);
  const [examsList, setExamsList] = useState(portalData.exams);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const mockStudentData = {
    student: { name: 'Ansika Singh', usn: '1XX22CS042', branch: 'CSE', semester: '6' },
    attendance: { percentage: 82, present: 98, total: 120 },
    gamification: { streakCount: 14, points: 1850, badges: ['Perfect Week', 'Early Bird', '30-Day Streak', 'Top Performer'] },
    anomaly: null,
    recent_logs: [
      { date: '2026-05-15', subject: 'Distributed Systems', status: 'Present' },
      { date: '2026-05-15', subject: 'Machine Learning', status: 'Present' },
      { date: '2026-05-14', subject: 'Software Engineering', status: 'Absent' },
      { date: '2026-05-14', subject: 'Digital Image Processing', status: 'Present' },
      { date: '2026-05-13', subject: 'Distributed Systems Lab', status: 'Present' },
    ]
  };

  const fetchStudentData = async () => {
    try {
      const response = await get(`/portal/${usn}/dashboard`);
      const result = await response.json();
      if (result.code === 200) {
        setData(result.data);
      } else {
        setData(mockStudentData);
      }
      
      const heatmapRes = await get(`/analytics/heatmap/${usn}`);
      const heatmapResult = await heatmapRes.json();
      if (heatmapResult.code === 200) {
        setHeatmapData(heatmapResult.data);
      }

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
    } catch (error) {
      console.error("Error fetching student data, using mock data:", error);
      setData(mockStudentData);
    } finally {
      setLoading(false);
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await post(`/portal/dispute`, { ...disputeForm, usn });
      if (response.ok) {
        alert(`${disputeForm.type === 'attendance' ? 'Dispute' : 'Complaint'} raised successfully!`);
        setShowDisputeModal(false);
      } else {
        alert(`${disputeForm.type === 'attendance' ? 'Dispute' : 'Complaint'} raised successfully! (demo)`);
        setShowDisputeModal(false);
      }
    } catch (error) {
      console.warn("Error raising dispute/complaint, falling back to visual confirmation:", error);
      alert(`${disputeForm.type === 'attendance' ? 'Dispute' : 'Complaint'} raised successfully! (demo)`);
      setShowDisputeModal(false);
    }
  };

  if (loading) return <div className="loading">Loading Portal...</div>;

  const filteredFaculty = portalData.faculty.filter(f => 
    f.name.toLowerCase().includes(facultySearch.toLowerCase()) || 
    f.dept.toLowerCase().includes(facultySearch.toLowerCase())
  );

  return (
    <div className="portal-container" style={{ overflowY: 'visible', minHeight: '100%' }}>
      <header className="portal-header">
        <div className="user-info">
          <div className="avatar profile-pic">
            <GraduationCap size={32} />
          </div>
          <div>
            <h1>{s('welcomeBack')}, {data?.student?.name}</h1>
            <p>{data?.student?.usn} • {data?.student?.branch} • {s('sem')} {data?.student?.semester}</p>
          </div>
        </div>
        <div className="stats-quickview">
          <div className="stat-pill">
            <Flame size={18} className="icon-streak" />
            <span>{data?.gamification?.streakCount || 0} {s('dayStreak')}</span>
          </div>
          <div className="stat-pill">
            <Award size={18} className="icon-points" />
            <span>{data?.gamification?.points || 0} {s('points')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)' }}>
            <Languages size={18} />
            <select 
              value={i18n.language}
              onChange={(e) => { i18n.changeLanguage(e.target.value); localStorage.setItem('lang', e.target.value); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontWeight: '500',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="en" style={{color: 'black'}}>English</option>
              <option value="kn" style={{color: 'black'}}>ಕನ್ನಡ</option>
              <option value="hi" style={{color: 'black'}}>हिन्दी</option>
            </select>
          </div>
          <button onClick={onLogout} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#dc2626', padding: '0.4rem 0.9rem', borderRadius: '20px',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', fontFamily: 'inherit'
          }}>
            {lang === 'hi' ? 'लॉग आउट' : lang === 'kn' ? 'ಲಾಗ್ ಔಟ್' : 'Log Out'}
          </button>
        </div>
      </header>

      <nav className="portal-tabs scrollable-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          <TrendingUp size={18} /> {s('overview')}
        </button>
        <button className={activeTab === 'academics' ? 'active' : ''} onClick={() => setActiveTab('academics')}>
          <BookOpen size={18} /> {s('academics')}
        </button>
        <button className={activeTab === 'campus' ? 'active' : ''} onClick={() => setActiveTab('campus')}>
          <CalendarDays size={18} /> {s('campus')}
        </button>
        <button className={activeTab === 'admin' ? 'active' : ''} onClick={() => setActiveTab('admin')}>
          <ShieldCheck size={18} /> {s('admin')}
        </button>
        <button className={activeTab === 'scanQR' ? 'active' : ''} onClick={() => setActiveTab('scanQR')} style={{ position: 'relative' }}>
          <QrCode size={18} /> {s('scanQR')}
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 7, height: 7, borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 0 2px rgba(16,185,129,0.3)'
          }} />
        </button>
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          <User size={18} /> {s('profile')}
        </button>
      </nav>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="portal-grid">
            {/* Attendance & Heatmap (Condensed) */}
            <div className="glass-card attendance-summary-card">
              <div className="card-header">
                <h3>Attendance Summary</h3>
                <TrendingUp size={20} />
              </div>
              <div className="summary-flex">
                <div className="circular-mini">
                   <svg viewBox="0 0 36 36" className="circular-chart-mini">
                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle" strokeDasharray={`${data?.attendance?.percentage || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <text x="18" y="20.35" className="percentage-mini">{data?.attendance?.percentage || 0}%</text>
                  </svg>
                </div>
                <div className="quick-stats">
                  <span><strong>{data?.attendance?.present}</strong> Present</span>
                  <span><strong>{data?.attendance?.total}</strong> Total</span>
                </div>
              </div>
            </div>

            <div className="glass-card announcement-preview-card">
              <div className="card-header">
                <h3>Latest Notices</h3>
                <Megaphone size={20} />
              </div>
              <div className="preview-list">
                {portalData.announcements.slice(0, 2).map(ann => (
                  <div key={ann.id} className="preview-item">
                    <div className={`priority-line ${ann.priority.toLowerCase()}`}></div>
                    <div>
                      <strong>{ann.title}</strong>
                      <small>{ann.date} • {ann.category}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card achievements-mini">
              <div className="card-header">
                <h3>Streaks & Badges</h3>
                <Flame size={20} className="icon-streak" />
              </div>
              <div className="streak-viz">
                <div className="streak-count">{data?.gamification?.streakCount || 0}</div>
                <p>Days active this month!</p>
              </div>
            </div>

            <div className="glass-card heatmap-card full-width">
              <div className="card-header">
                <h3>Attendance Density</h3>
                <Calendar size={20} />
              </div>
              <HeatmapCalendar data={heatmapData} />
            </div>
          </div>
        )}

        {activeTab === 'academics' && (
          <div className="portal-grid">
             {/* Assignments & Projects */}
             <div className="glass-card assignments-card full-width">
              <div className="card-header">
                <h3>Assignments & Project Tracking</h3>
                <ListTodo size={20} />
              </div>
              <div className="academics-sub-grid">
                <div className="assignment-list-container">
                  <h5>Assignments</h5>
                  <div className="task-list">
                    {assignmentsList.map(task => (
                      <div key={task.id || task.title} className="task-item">
                        <div className="task-check">
                          {task.status === 'Submitted' || task.submitted > 0 ? <CheckCircle size={20} className="success" /> : <Clock size={20} className="pending" />}
                        </div>
                        <div className="task-info">
                          <strong>{task.title}</strong>
                          <span>{task.course} • Due: {task.due}</span>
                        </div>
                        <span className={`priority-tag ${(task.priority || 'Medium').toLowerCase()}`}>{task.priority || 'Medium'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="project-list-container">
                  <h5>Ongoing Projects</h5>
                  <div className="project-cards">
                    {portalData.projects.map(proj => (
                      <div key={proj.id} className="project-mini-card">
                        <div className="proj-header">
                          <strong>{proj.name}</strong>
                          <span className="phase-tag">{proj.phase}</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar" style={{ width: `${proj.progress}%` }}></div>
                        </div>
                        <div className="proj-footer">
                          <span>Progress: {proj.progress}%</span>
                          <span>Team: {proj.team}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Labs & Exams side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', gridColumn: '1 / -1' }}>
              <div className="glass-card labs-card">
                <div className="card-header">
                  <h3>{s('labReports')}</h3>
                  <FlaskConical size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {portalData.labs.map(lab => (
                    <div key={lab.id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: '4px solid var(--accent-primary)'
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{lab.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>📅 {s('everyDay')} {lab.day}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.78rem', fontWeight: 700, padding: '0.3rem 0.7rem', borderRadius: '20px' }}>
                          ✓ {lab.reports} Done
                        </span>
                        {lab.pending > 0 && (
                          <span style={{ background: '#fff7ed', color: '#c2410c', fontSize: '0.78rem', fontWeight: 700, padding: '0.3rem 0.7rem', borderRadius: '20px' }}>
                            ⚠ {lab.pending} Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exams & Results */}
              <div className="glass-card exam-results-combo">
              <div className="card-header">
                <h3>Exams & Results</h3>
                <FileText size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Upcoming</div>
                {examsList.slice(0, 4).map(e => (
                  <div key={e.id || e.subject} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.subject}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{e.room || 'TBD'} • {e.time || 'TBD'}</div>
                    </div>
                    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.7rem', borderRadius: '20px' }}>
                      📅 {e.date && e.date.includes('-') ? e.date.slice(5) : e.date || 'TBD'}
                    </span>
                  </div>
                ))}
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.5rem 0 0.25rem' }}>Past Results</div>
                {portalData.results.slice(0, 3).map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.subject}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.marks}</div>
                    </div>
                    <span style={{ background: 'rgba(236,72,153,0.1)', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 800, padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                      {r.grade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            </div>{/* end labs+exams wrapper */}

            {/* Course Materials */}
            <div className="glass-card courses-card full-width">
              <div className="card-header">
                <h3>Course Materials & Syllabus</h3>
                <BookOpen size={20} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {portalData.courses.map(course => (
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
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
                  {selectedCourse ? (
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{selectedCourse.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '1.25rem' }}>👨‍🏫 {selectedCourse.instructor}</p>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Syllabus</h5>
                        <p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{selectedCourse.syllabus}</p>
                      </div>
                      <div>
                        <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Resources</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {selectedCourse.notes.map((note, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                                <FileText size={15} style={{ color: 'var(--accent-primary)' }} />
                                {note.title}
                              </div>
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}><Download size={16} /></button>
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
            <div className="glass-card calendar-card full-width">
              <div className="card-header">
                <h3>Campus Events & Holidays</h3>
                <CalendarDays size={20} />
              </div>
              <CampusCalendar events={portalData.events} />
            </div>

            <div className="glass-card announcements-card full-width">
              <div className="card-header">
                <h3>Official Announcements & Circulars</h3>
                <Megaphone size={20} />
              </div>
              <div className="announcement-grid">
                {portalData.announcements.map(ann => (
                  <div key={ann.id} className="announcement-card-item">
                    <div className={`ann-tag ${ann.priority.toLowerCase()}`}>{ann.priority}</div>
                    <h4>{ann.title}</h4>
                    <p>Released on {ann.date} • {ann.category}</p>
                    <button className="btn-text">Read Full Circular <ExternalLink size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card faculty-card full-width">
              <div className="card-header">
                <h3>Faculty Directory</h3>
                <Users size={20} />
              </div>
              <div className="search-bar">
                <Search size={18} />
                <input type="text" placeholder="Search by name or department..." value={facultySearch} onChange={e => setFacultySearch(e.target.value)} />
              </div>
              <div className="faculty-grid">
                {filteredFaculty.map((fac, i) => (
                  <div key={i} className="faculty-item">
                    <div className="fac-avatar">{fac.image}</div>
                    <div className="fac-info">
                      <strong>{fac.name}</strong>
                      <span>{fac.role} • {fac.dept}</span>
                      <div className="fac-contacts">
                        <Mail size={14} /> <span>{fac.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card complaint-card full-width">
              <div className="card-header">
                <h3>Grievance & Support</h3>
                <MessageSquare size={20} />
              </div>
              <div className="grievance-flex">
                 <div className="grievance-info">
                    <p>Submit your concerns regarding campus life, infrastructure, or academic hurdles.</p>
                    <button className="btn-primary" onClick={() => { setDisputeForm({...disputeForm, type: 'complaint'}); setShowDisputeModal(true); }}>
                      Raise New Grievance
                    </button>
                 </div>
                 <div className="grievance-status-pills">
                    <div className="g-pill"><span>Open</span><strong>0</strong></div>
                    <div className="g-pill"><span>Pending</span><strong>1</strong></div>
                    <div className="g-pill"><span>Resolved</span><strong>12</strong></div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scanQR' && (
          <div className="portal-grid">
            <div className="glass-card full-width" style={{ padding: '2rem' }}>
              <QRScanner usn={usn} lang={lang} />
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="portal-grid">
            <div className="glass-card fee-card">
              <div className="card-header">
                <h3>Fee Management</h3>
                <CreditCard size={20} />
              </div>
              <div className="fee-status">
                 <div className="fee-main">
                    <span>Outstanding Balance</span>
                    <h2>₹{portalData.fees.due.toLocaleString()}</h2>
                 </div>
                 <button className="btn-primary full-width">Pay Outstanding Fee</button>
              </div>
              <div className="fee-history">
                 <h5>Payment History</h5>
                 {portalData.fees.history.map((txn, i) => (
                    <div key={i} className="txn-item">
                       <div className="txn-info">
                          <strong>₹{txn.amount.toLocaleString()}</strong>
                          <span>{txn.date} • {txn.id}</span>
                       </div>
                       <button className="btn-icon"><Download size={16} /></button>
                    </div>
                 ))}
              </div>
            </div>

            <div className="glass-card library-card">
              <div className="card-header">
                <h3>Library & Digital Card</h3>
                <BookMarked size={20} />
              </div>
              <div className="lib-card-viz">
                 <div className="lib-header">COLLEGE LIBRARY</div>
                 <div className="lib-body">
                    <div className="lib-qr" style={{ padding: '2px', overflow: 'hidden', background: 'white' }}>
                       <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data?.student?.usn || 'LIB-2026-0992'}`} alt="Library QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div className="lib-details">
                       <strong>{data?.student?.name}</strong>
                       <span>{portalData.library.cardNo}</span>
                    </div>
                 </div>
              </div>
              <div className="borrowed-books">
                 <h5>Current Loans</h5>
                 {portalData.library.booksBorrowed.map((book, i) => (
                    <div key={i} className={`book-item ${book.status.toLowerCase()}`}>
                       <span>{book.title}</span>
                       <small>Due: {book.due}</small>
                    </div>
                 ))}
                 {portalData.library.fine > 0 && <div className="lib-fine">Pending Fine: ₹{portalData.library.fine}</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-dashboard-layout">
            <div className="profile-sidebar">
              <div className="glass-card id-card-portrait">
                <div className="card-header">
                  <h3>Identity Card</h3>
                  <Badge size={20} />
                </div>
                <div className="id-portrait-content">
                   <div className="id-photo-large"><GraduationCap size={56} /></div>
                   <h2 className="profile-name">{data?.student?.name}</h2>
                   <span className="profile-role">Computer Science Student</span>
                   <div className="id-fields-stacked">
                      <div className="field"><span>USN</span><strong>{data?.student?.usn}</strong></div>
                      <div className="field"><span>Branch</span><strong>{data?.student?.branch}</strong></div>
                      <div className="field"><span>Batch</span><strong>2022-2026</strong></div>
                      <div className="field"><span>Blood Group</span><strong>O+</strong></div>
                   </div>
                </div>
              </div>

              <div className="glass-card settings-card">
                <div className="card-header">
                  <h3>Settings</h3>
                  <Settings size={20} />
                </div>
                <div className="settings-options">
                   <button className="btn-setting"><span>Change Password</span> <ChevronRight size={16}/></button>
                   <button className="btn-setting"><span>Two-Factor Auth</span> <span className="status-off">Off</span></button>
                   <button className="btn-setting"><span>Notifications</span> <ChevronRight size={16}/></button>
                   <button className="btn-setting danger"><span>Deactivate Access</span></button>
                </div>
              </div>
            </div>

            <div className="profile-main">
              <div className="glass-card personal-info-card">
                <div className="card-header">
                  <h3>Personal & Family Details</h3>
                  <Home size={20} />
                </div>
                <div className="profile-sections-new">
                   <div className="p-sec-new">
                      <div className="p-sec-icon-title"><Mail size={16} /> <h5>Contact Information</h5></div>
                      <div className="info-grid">
                        <div className="info-item"><span>Email</span><p>{portalData.profile.personal.email}</p></div>
                        <div className="info-item"><span>Phone</span><p>{portalData.profile.personal.phone}</p></div>
                        <div className="info-item full"><span>Residential Address</span><p>{portalData.profile.personal.address}</p></div>
                      </div>
                   </div>
                   <div className="p-sec-divider"></div>
                   <div className="p-sec-new">
                      <div className="p-sec-icon-title"><Users size={16} /> <h5>Family Guardians</h5></div>
                      <div className="info-grid">
                        <div className="info-item"><span>Father's Name</span><p>{portalData.profile.family.father}</p></div>
                        <div className="info-item"><span>Mother's Name</span><p>{portalData.profile.family.mother}</p></div>
                        <div className="info-item full"><span>Emergency Contact</span><p className="emergency-text">{portalData.profile.family.emergency}</p></div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="glass-card documents-card">
                <div className="card-header">
                  <h3>Document Vault</h3>
                  <Upload size={20} />
                </div>
                <div className="doc-grid">
                   {portalData.profile.documents.map((doc, i) => (
                      <div key={i} className="doc-item-box">
                         <div className="doc-icon"><Paperclip size={24} /></div>
                         <div className="doc-info-new">
                            <strong>{doc.name}</strong>
                            <small>{doc.size} • {doc.type}</small>
                         </div>
                         <button className="btn-icon"><Download size={18} /></button>
                      </div>
                   ))}
                   <button className="doc-item-box upload-new">
                      <div className="doc-icon-upload"><Upload size={24} /></div>
                      <div className="doc-info-new">
                         <strong>Upload New Document</strong>
                         <small>PDF, JPG, PNG up to 5MB</small>
                      </div>
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDisputeModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <h2>{disputeForm.type === 'attendance' ? 'Raise Attendance Dispute' : 'Submit Grievance'}</h2>
            <form onSubmit={handleDisputeSubmit}>
              <div className="form-group">
                <label>{disputeForm.type === 'attendance' ? 'Subject' : 'Category'}</label>
                <input type="text" required value={disputeForm.subject} onChange={e => setDisputeForm({...disputeForm, subject: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Details</label>
                <textarea required value={disputeForm.reason} onChange={e => setDisputeForm({...disputeForm, reason: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowDisputeModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
