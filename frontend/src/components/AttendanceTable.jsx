import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';

const AttendanceTable = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ overflowX: 'auto' }}>
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
            {currentData.map((row, idx) => (
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

      {/* Pagination Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingTop: '1rem',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} logs
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            className="btn-icon" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            style={{ padding: '4px' }}
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: '0.9rem', minWidth: '80px', textAlign: 'center' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="btn-icon" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            style={{ padding: '4px' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;
