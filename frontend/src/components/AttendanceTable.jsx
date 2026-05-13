import React from 'react';

const AttendanceTable = ({ data }) => {
  return (
    <div className="glass-panel" style={{ overflowX: 'auto' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>Recent Attendance Logs</h3>
      <table className="custom-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>USN</th>
            <th>Subject</th>
            <th>Time In</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td style={{ fontWeight: 500 }}>{row.name}</td>
              <td style={{ color: 'var(--text-secondary)' }}>{row.usn}</td>
              <td>{row.subject}</td>
              <td>{row.timeIn}</td>
              <td>{row.duration} mins</td>
              <td>
                <span className={`status-badge status-${row.status.toLowerCase()}`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
