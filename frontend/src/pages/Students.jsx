import React, { useState } from 'react';
import { Search, UserPlus, Upload, ChevronDown, X, User, GraduationCap, Filter } from 'lucide-react';
import './Students.css';

const INDIAN_NAMES = ["Aarav", "Aaryan", "Advait", "Akash", "Amit", "Ananya", "Aniket", "Anika", "Arjun", "Aryan", "Ayush", "Bhavya", "Chaitanya", "Dev", "Diya", "Gaurav", "Ishaan", "Ishani", "Karan", "Kavya", "Manish", "Mayank", "Myra", "Navya", "Nikhil", "Parth", "Pranav", "Priyanka", "Rahul", "Riya", "Rohan", "Saanvi", "Siddharth", "Sneha", "Tanvi", "Uday", "Varun", "Vihaan", "Yash", "Zoya"];
const LAST_NAMES = ["Sharma", "Verma", "Singh", "Patel", "Gupta", "Reddy", "Iyer", "Nair", "Kulkarni", "Deshmukh", "Joshi", "Rao", "Bhat", "Agarwal", "Bansal"];

const MOCK_STUDENTS = Array.from({ length: 50 }, (_, i) => {
  const first = INDIAN_NAMES[i % INDIAN_NAMES.length];
  const last = LAST_NAMES[i % LAST_NAMES.length];
  return {
    usn: `1CD24CS${String(i + 1).padStart(3, '0')}`,
    name: `${first} ${last}`,
    branch: "CSE",
    semester: 5,
    section: i < 25 ? "A" : "B",
    enrollmentStatus: i < 42 ? "ENROLLED" : "PENDING",
    parentContact: `+91 ${9800000000 + i}`,
    attendancePercent: i < 42 ? Math.floor(Math.random() * (98 - 75 + 1) + 75) : 0
  };
});


const Students = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({ usn: '', name: '', branch: 'CSE', semester: 5, section: 'A', parentContact: '' });
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const filteredStudents = MOCK_STUDENTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.usn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = filterBranch === 'ALL' || s.branch === filterBranch;
    const matchesStatus = filterStatus === 'ALL' || s.enrollmentStatus === filterStatus;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const branches = ['ALL', ...new Set(MOCK_STUDENTS.map(s => s.branch))];

  const handleAddStudent = (e) => {
    e.preventDefault();
    // In production, this would POST to /api/students
    console.log('Adding student:', newStudent);
    setShowAddModal(false);
    setNewStudent({ usn: '', name: '', branch: 'CSE', semester: 5, section: 'A', parentContact: '' });
  };

  return (
    <div className="students-page">
      <header className="page-header">
        <div>
          <h2 className="page-title">Student Management</h2>
          <p className="page-subtitle">Manage enrollments and face registration status.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => {}}>
            <Upload size={16} />
            <span>Bulk Import</span>
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="students-stats-row">
        <div className="mini-stat glass-panel">
          <span className="mini-stat-value">{MOCK_STUDENTS.length}</span>
          <span className="mini-stat-label">Total Students</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-value" style={{ color: 'var(--accent-success)' }}>
            {MOCK_STUDENTS.filter(s => s.enrollmentStatus === 'ENROLLED').length}
          </span>
          <span className="mini-stat-label">Enrolled</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-value" style={{ color: 'var(--accent-warning)' }}>
            {MOCK_STUDENTS.filter(s => s.enrollmentStatus === 'PENDING').length}
          </span>
          <span className="mini-stat-label">Pending</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-value" style={{ color: 'var(--accent-danger)' }}>
            {MOCK_STUDENTS.filter(s => s.attendancePercent > 0 && s.attendancePercent < 75).length}
          </span>
          <span className="mini-stat-label">At Risk (&lt;75%)</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="filters-bar glass-panel">
        <div className="search-box">
          <Search size={18} />
          <input
            id="student-search"
            type="text"
            placeholder="Search by name or USN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="select-wrapper">
            <Filter size={14} />
            <select id="filter-branch" value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
              {branches.map(b => <option key={b} value={b}>{b === 'ALL' ? 'All Branches' : b}</option>)}
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
          <div className="select-wrapper">
            <select id="filter-status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="ENROLLED">Enrolled</option>
              <option value="PENDING">Pending</option>
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-panel students-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>USN</th>
              <th>Branch</th>
              <th>Sem / Sec</th>
              <th>Attendance</th>
              <th>Face Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.usn} className="student-row">
                <td>
                  <div className="student-name-cell">
                    <div className="avatar-circle">
                      <User size={16} />
                    </div>
                    <span style={{ fontWeight: 500 }}>{student.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.9rem' }}>{student.usn}</td>
                <td>
                  <span className="branch-badge">{student.branch}</span>
                </td>
                <td>{student.semester} / {student.section}</td>
                <td>
                  <div className="attendance-bar-container">
                    <div className="attendance-bar" style={{
                      width: `${student.attendancePercent}%`,
                      background: student.attendancePercent >= 75
                        ? 'var(--accent-success)'
                        : student.attendancePercent >= 50
                          ? 'var(--accent-warning)'
                          : 'var(--accent-danger)'
                    }} />
                    <span className="attendance-text">{student.attendancePercent}%</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${student.enrollmentStatus === 'ENROLLED' ? 'present' : 'late'}`}>
                    {student.enrollmentStatus}
                  </span>
                </td>
                <td>
                  {student.enrollmentStatus === 'PENDING' ? (
                    <button 
                      className="btn-primary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowRegisterModal(true);
                      }}
                    >
                      Register Face
                    </button>
                  ) : (
                    <button className="btn-icon" title="View Details">
                      <GraduationCap size={16} />
                    </button>
                  )}
                </td>


              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="empty-state">
            <User size={40} />
            <p>No students match your filters.</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Student</h3>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="modal-form">
              <div className="form-group">
                <label htmlFor="add-usn">USN</label>
                <input id="add-usn" type="text" placeholder="e.g. 1XX19CS001" required
                  value={newStudent.usn} onChange={e => setNewStudent({ ...newStudent, usn: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="add-name">Full Name</label>
                <input id="add-name" type="text" placeholder="Student full name" required
                  value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="add-branch">Branch</label>
                  <select id="add-branch" value={newStudent.branch} onChange={e => setNewStudent({ ...newStudent, branch: e.target.value })}>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="CV">CV</option>
                    <option value="ISE">ISE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="add-semester">Semester</label>
                  <input id="add-semester" type="number" min="1" max="8" required
                    value={newStudent.semester} onChange={e => setNewStudent({ ...newStudent, semester: parseInt(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label htmlFor="add-section">Section</label>
                  <select id="add-section" value={newStudent.section} onChange={e => setNewStudent({ ...newStudent, section: e.target.value })}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="add-contact">Parent Contact</label>
                <input id="add-contact" type="tel" placeholder="+1234567890"
                  value={newStudent.parentContact} onChange={e => setNewStudent({ ...newStudent, parentContact: e.target.value })} />
                {/* Face Registration Modal */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal glass-panel" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Face Registration: {selectedStudent?.name}</h3>
              <button className="btn-icon" onClick={() => {
                setShowRegisterModal(false);
                setIsCapturing(false);
              }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ 
                width: '100%', 
                aspectRatio: '4/3', 
                background: 'black', 
                borderRadius: 'var(--radius-md)', 
                overflow: 'hidden',
                position: 'relative',
                marginBottom: '1.5rem'
              }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
                
                {!isCapturing && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', cursor: 'pointer' }}
                    onClick={async () => {
                      try {
                        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                        videoRef.current.srcObject = stream;
                        setIsCapturing(true);
                      } catch (err) {
                        alert("Could not access camera: " + err.message);
                      }
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <Camera size={48} style={{ marginBottom: '1rem' }} />
                      <p>Click to Start Camera</p>
                    </div>
                  </div>
                )}
              </div>

              {isCapturing && (
                <button 
                  className="btn-primary" 
                  style={{ width: '100%' }}
                  onClick={async () => {
                    const canvas = canvasRef.current;
                    const video = videoRef.current;
                    canvas.getContext('2d').drawImage(video, 0, 0, 640, 480);
                    
                    canvas.toBlob(async (blob) => {
                      const formData = new FormData();
                      formData.append('file', blob, `${selectedStudent.usn}.jpg`);
                      formData.append('usn', selectedStudent.usn);
                      
                      try {
                        await axios.post('http://localhost:8000/api/registration/register', formData);
                        alert("Face Registered Successfully!");
                        setShowRegisterModal(false);
                        // In production, update student status in state here
                      } catch (err) {
                        alert("Failed to upload: " + err.message);
                      }
                      
                      // Stop camera
                      video.srcObject.getTracks().forEach(track => track.stop());
                      setIsCapturing(false);
                    }, 'image/jpeg');
                  }}
                >
                  Capture & Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
