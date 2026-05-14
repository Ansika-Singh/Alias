import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock, Download } from 'lucide-react';
import StatCard from '../components/StatCard';
import AttendanceTable from '../components/AttendanceTable';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';


// Mock Data for MVP
const MOCK_STATS = [
  { title: "Total Enrolled", value: "50", icon: Users, trend: 0 },
  { title: "Present Today", value: "42", icon: UserCheck, trend: 1.5 },
  { title: "Absent Today", value: "8", icon: UserX, trend: -0.5 },
  { title: "Late Arrivals", value: "3", icon: Clock, trend: 0.2 },
];

const MOCK_CHART_DATA = [
  { name: 'Mon', attendance: 42 },
  { name: 'Tue', attendance: 38 },
  { name: 'Wed', attendance: 45 },
  { name: 'Thu', attendance: 40 },
  { name: 'Fri', attendance: 42 },
  { name: 'Sat', attendance: 30 },
  { name: 'Sun', attendance: 10 },
];



const MOCK_ATTENDANCE = [
  { name: "Alex Johnson", usn: "1XX19CS001", subject: "Data Structures", timeIn: "09:05 AM", duration: 55, status: "PRESENT" },
  { name: "Siddharth Smith", usn: "1XX19CS042", subject: "Data Structures", timeIn: "09:12 AM", duration: 48, status: "LATE" },
  { name: "Michael Chang", usn: "1XX19CS088", subject: "Data Structures", timeIn: "--", duration: 0, status: "ABSENT" },
  { name: "Pranav Patel", usn: "1XX19CS102", subject: "Operating Systems", timeIn: "10:00 AM", duration: 60, status: "PRESENT" },
  { name: "Rahul Sharma", usn: "1XX19CS099", subject: "Operating Systems", timeIn: "10:02 AM", duration: 58, status: "PRESENT" },
  { name: "John Doe", usn: "1XX19CS023", subject: "Python", timeIn: "11:15 AM", duration: 60, status: "PRESENT" },
  { name: "James Roe", usn: "1XX19CS045", subject: "Python", timeIn: "11:20 AM", duration: 55, status: "LATE" },
  { name: "Aryan Sharma", usn: "1XX19CS012", subject: "Java", timeIn: "09:00 AM", duration: 60, status: "PRESENT" },
];

const Dashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Overview</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Live attendance metrics for today.</p>
        </div>
        <button 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => window.open('http://localhost:8000/api/attendance/export', '_blank')}
        >
          <Download size={18} />
          Export to Excel
        </button>
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
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Attendance Trend (Weekly)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorAttend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(23, 23, 23, 0.8)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--accent-primary)' }}
                />
                <Area type="monotone" dataKey="attendance" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorAttend)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Quick Stats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Highest Attendance</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>98% (Wednesday)</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Most Frequent Subject</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>Data Structures</span>
            </div>
            <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                <strong>Alert:</strong> 3 students are currently at risk with attendance below 75%.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Recent Attendance Logs</h3>
          <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>View All Logs</button>
        </div>
        <AttendanceTable data={MOCK_ATTENDANCE} />
      </div>

    </div>
  );
};

export default Dashboard;
