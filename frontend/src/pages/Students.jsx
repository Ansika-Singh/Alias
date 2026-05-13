import React, { useState } from 'react';
import { Search, UserPlus, Upload, ChevronDown, X, User, GraduationCap, Filter } from 'lucide-react';
import './Students.css';

const MOCK_STUDENTS = [
  { usn: "1XX19CS001", name: "Alex Johnson", branch: "CSE", semester: 5, section: "A", enrollmentStatus: "ENROLLED", parentContact: "+1234567890", attendancePercent: 92 },
  { usn: "1XX19CS042", name: "Sarah Smith", branch: "CSE", semester: 5, section: "A", enrollmentStatus: "ENROLLED", parentContact: "+1234567891", attendancePercent: 78 },
  { usn: "1XX19CS088", name: "Michael Chang", branch: "CSE", semester: 5, section: "B", enrollmentStatus: "PENDING", parentContact: "+1234567892", attendancePercent: 0 },
  { usn: "1XX19CS102", name: "Priya Patel", branch: "CSE", semester: 5, section: "A", enrollmentStatus: "ENROLLED", parentContact: "+1234567893", attendancePercent: 95 },
  { usn: "1XX19EC015", name: "David Wilson", branch: "ECE", semester: 5, section: "A", enrollmentStatus: "ENROLLED", parentContact: "+1234567894", attendancePercent: 65 },
  { usn: "1XX19ME033", name: "Emma Davis", branch: "ME", semester: 3, section: "B", enrollmentStatus: "PENDING", parentContact: "+1234567895", attendancePercent: 0 },
  { usn: "1XX19CS055", name: "Rahul Sharma", branch: "CSE", semester: 5, section: "B", enrollmentStatus: "ENROLLED", parentContact: "+1234567896", attendancePercent: 88 },
  { usn: "1XX19CS071", name: "Lisa Chen", branch: "CSE", semester: 5, section: "A", enrollmentStatus: "ENROLLED", parentContact: "+1234567897", attendancePercent: 71 },
];

const Students = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ usn: '', name: '', branch: 'CSE', semester: 5, section: 'A', parentContact: '' });

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
                  <button className="btn-icon" title="View Details">
                    <GraduationCap size={16} />
                  </button>
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
