import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Upload, ChevronDown, X, User, GraduationCap, Filter, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Students.css';
import { get, post, postMultipart } from '../utils/api';

const MOCK_STUDENTS = Array.from({ length: 50 }, (_, i) => {
  const names = ["Aarav Sharma","Aaryan Verma","Advait Singh","Akash Patel","Amit Gupta","Ananya Reddy","Aniket Iyer","Anika Nair","Arjun Kulkarni","Aryan Deshmukh","Ayush Joshi","Bhavya Rao","Chaitanya Bhat","Dev Agarwal","Diya Bansal","Gaurav Sharma","Ishaan Verma","Ishani Singh","Karan Patel","Kavya Gupta","Manish Reddy","Mayank Iyer","Myra Nair","Navya Kulkarni","Nikhil Deshmukh","Parth Joshi","Pranav Rao","Priyanka Bhat","Rahul Agarwal","Riya Bansal","Rohan Sharma","Saanvi Verma","Siddharth Singh","Sneha Patel","Tanvi Gupta","Uday Reddy","Varun Iyer","Vihaan Nair","Yash Kulkarni","Zoya Deshmukh"];
  return {
    usn: `1CD24CS${String(i + 1).padStart(3, '0')}`,
    name: names[i % names.length],
    branch: "CSE", semester: 5,
    section: i < 25 ? "A" : "B",
    enrollmentStatus: i < 42 ? "ENROLLED" : "PENDING",
    parentContact: `+91 ${9800000000 + i}`,
    attendancePercent: i < 42 ? Math.floor(Math.random() * 24 + 75) : 0
  };
});

const Students = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({ usn: '', name: '', branch: 'CSE', semester: 5, section: 'A', parentContact: '' });
  const [isCapturing, setIsCapturing] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const response = await get('/students/');
      const result = await response.json();
      if (result.code === 200) setStudents(result.data);
      else setStudents(MOCK_STUDENTS);
    } catch { setStudents(MOCK_STUDENTS); }
    finally { setLoading(false); }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.usn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = filterBranch === 'ALL' || s.branch === filterBranch;
    const matchesStatus = filterStatus === 'ALL' || s.enrollmentStatus === filterStatus;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const branches = ['ALL', ...new Set(students.map(s => s.branch))];

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await post('/students/', newStudent);
      const result = await response.json();
      if (result.code === 200) {
        setShowAddModal(false);
        setNewStudent({ usn: '', name: '', branch: 'CSE', semester: 5, section: 'A', parentContact: '' });
        fetchStudents();
      } else alert(result.message);
    } catch (err) { console.error(err); }
  };

  if (loading) return null;

  return (
    <div className="students-page">
      <header className="page-header">
        <div>
          <h2 className="page-title">{t('studentManagement')}</h2>
          <p className="page-subtitle">{t('manageEnrollments')}</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary"><Upload size={16} /><span>{t('bulkImport')}</span></button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}><UserPlus size={16} /><span>{t('addStudent')}</span></button>
        </div>
      </header>

      <div className="students-stats-row">
        <div className="mini-stat glass-panel">
          <span className="mini-stat-value">{students.length}</span>
          <span className="mini-stat-label">{t('totalStudents')}</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-value" style={{ color: 'var(--accent-success)' }}>
            {students.filter(s => s.enrollmentStatus === 'ENROLLED').length}
          </span>
          <span className="mini-stat-label">{t('enrolled')}</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-value" style={{ color: 'var(--accent-warning)' }}>
            {students.filter(s => s.enrollmentStatus === 'PENDING').length}
          </span>
          <span className="mini-stat-label">{t('pending')}</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-value" style={{ color: 'var(--accent-danger)' }}>
            {students.filter(s => s.attendancePercent > 0 && s.attendancePercent < 75).length}
          </span>
          <span className="mini-stat-label">{t('atRisk')}</span>
        </div>
      </div>

      <div className="filters-bar glass-panel">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder={t('searchStudent')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="filter-group">
          <div className="select-wrapper">
            <Filter size={14} />
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
              {branches.map(b => <option key={b} value={b}>{b === 'ALL' ? t('allBranches') : b}</option>)}
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
          <div className="select-wrapper">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="ALL">{t('allStatus')}</option>
              <option value="ENROLLED">{t('enrolled')}</option>
              <option value="PENDING">{t('pending')}</option>
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
        </div>
      </div>

      <div className="glass-panel students-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>{t('students')}</th>
              <th>{t('usn')}</th>
              <th>{t('branch')}</th>
              <th>{t('semSec')}</th>
              <th>{t('attendance')}</th>
              <th>{t('faceStatus')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.usn} className="student-row">
                <td>
                  <div className="student-name-cell">
                    <div className="avatar-circle"><User size={16} /></div>
                    <span style={{ fontWeight: 500 }}>{student.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.9rem' }}>{student.usn}</td>
                <td><span className="branch-badge">{student.branch}</span></td>
                <td>{student.semester} / {student.section}</td>
                <td>
                  <div className="attendance-bar-container">
                    <div className="attendance-bar" style={{
                      width: `${student.attendancePercent || 0}%`,
                      background: (student.attendancePercent || 0) >= 75 ? 'var(--accent-success)' : (student.attendancePercent || 0) >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)'
                    }} />
                    <span className="attendance-text">{student.attendancePercent || 0}%</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${student.enrollmentStatus === 'ENROLLED' ? 'present' : 'late'}`}>
                    {student.enrollmentStatus === 'ENROLLED' ? t('enrolledStatus') : t('pendingStatus')}
                  </span>
                </td>
                <td>
                  {student.enrollmentStatus === 'PENDING' ? (
                    <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                      onClick={() => { setSelectedStudent(student); setShowRegisterModal(true); }}>
                      {t('registerFace')}
                    </button>
                  ) : (
                    <button className="btn-icon" title="View Details"><GraduationCap size={16} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="empty-state"><User size={40} /><p>{t('noStudents')}</p></div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('addStudent')}</h3>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddStudent} className="modal-form">
              <div className="form-group">
                <label>USN</label>
                <input type="text" placeholder="e.g. 1XX19CS001" required value={newStudent.usn} onChange={e => setNewStudent({ ...newStudent, usn: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Student full name" required value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Branch</label>
                  <select value={newStudent.branch} onChange={e => setNewStudent({ ...newStudent, branch: e.target.value })}>
                    <option>CSE</option><option>ECE</option><option>ME</option><option>CV</option><option>ISE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <input type="number" min="1" max="8" required value={newStudent.semester} onChange={e => setNewStudent({ ...newStudent, semester: parseInt(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <select value={newStudent.section} onChange={e => setNewStudent({ ...newStudent, section: e.target.value })}>
                    <option>A</option><option>B</option><option>C</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Parent Contact</label>
                <input type="tel" placeholder="+1234567890" value={newStudent.parentContact} onChange={e => setNewStudent({ ...newStudent, parentContact: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{t('addStudent')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal glass-panel" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{t('registerFace')}: {selectedStudent?.name}</h3>
              <button className="btn-icon" onClick={() => { setShowRegisterModal(false); setIsCapturing(false); }}><X size={20} /></button>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: '100%', aspectRatio: '4/3', background: 'black', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', marginBottom: '1.5rem' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
                {!isCapturing && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', cursor: 'pointer' }}
                    onClick={async () => {
                      try {
                        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                        videoRef.current.srcObject = stream;
                        setIsCapturing(true);
                      } catch (err) { alert("Could not access camera: " + err.message); }
                    }}>
                    <div style={{ textAlign: 'center', color: 'white' }}>
                      <Camera size={48} style={{ marginBottom: '1rem' }} />
                      <p>Click to Start Camera</p>
                    </div>
                  </div>
                )}
              </div>
              {isCapturing && (
                <button className="btn-primary" style={{ width: '100%' }}
                  onClick={async () => {
                    const canvas = canvasRef.current;
                    const video = videoRef.current;
                    canvas.getContext('2d').drawImage(video, 0, 0, 640, 480);
                    canvas.toBlob(async (blob) => {
                      const formData = new FormData();
                      formData.append('file', blob, `${selectedStudent.usn}.jpg`);
                      formData.append('usn', selectedStudent.usn);
                      try {
                        const response = await postMultipart('/registration/register', formData);
                        const result = await response.json();
                        if (result.code === 200) { alert("Face Registered Successfully!"); setShowRegisterModal(false); fetchStudents(); }
                        else alert(result.message);
                      } catch (err) { alert("Failed to upload: " + err.message); }
                      if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
                      setIsCapturing(false);
                    }, 'image/jpeg');
                  }}>
                  Capture & Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
