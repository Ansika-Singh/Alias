import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import AttendanceTable from '../components/AttendanceTable';

// Mock Data for MVP
const MOCK_STATS = [
  { title: "Total Enrolled", value: "450", icon: Users, trend: 0 },
  { title: "Present Today", value: "398", icon: UserCheck, trend: 2.5 },
  { title: "Absent Today", value: "40", icon: UserX, trend: -1.2 },
  { title: "Late Arrivals", value: "12", icon: Clock, trend: 0.5 },
];

const MOCK_ATTENDANCE = [
  { name: "Alex Johnson", usn: "1XX19CS001", subject: "Data Structures", timeIn: "09:05 AM", duration: 55, status: "PRESENT" },
  { name: "Sarah Smith", usn: "1XX19CS042", subject: "Data Structures", timeIn: "09:12 AM", duration: 48, status: "LATE" },
  { name: "Michael Chang", usn: "1XX19CS088", subject: "Data Structures", timeIn: "--", duration: 0, status: "ABSENT" },
  { name: "Priya Patel", usn: "1XX19CS102", subject: "Operating Systems", timeIn: "10:00 AM", duration: 60, status: "PRESENT" },
];

const Dashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Overview</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Live attendance metrics for today.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {MOCK_STATS.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AttendanceTable data={MOCK_ATTENDANCE} />
        </div>
        
        {/* Placeholder for Camera Feed or Quick Actions */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Camera Feed Status</h3>
          <div style={{ 
            height: '200px', 
            background: 'rgba(0,0,0,0.3)', 
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed var(--border-glass)'
          }}>
            <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--accent-success)', borderRadius: '50%', display: 'inline-block' }}></span>
              Node Active (Main Hall)
            </span>
          </div>
          <button className="btn-primary" style={{ marginTop: 'auto' }}>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
