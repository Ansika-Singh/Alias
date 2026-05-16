import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { 
  BarChart2, UserCheck, BookOpen, Users, 
  ShieldAlert, Download, Search, Plus,
  AlertCircle, TrendingUp, ChevronRight
} from 'lucide-react-native';
import { get, getAuth } from '../utils/api';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const auth = getAuth();
  const isPrincipal = auth.role === 'principal';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, trendRes, studentRes] = await Promise.all([
        get('/analytics/dashboard'),
        get('/analytics/trends/A/5'), // Example section/sem
        get('/students/')
      ]);

      const dashData = await dashRes.json();
      const trendData = await trendRes.json();
      const studentData = await studentRes.json();

      if (dashData.code === 200) setData(dashData.data);
      if (trendData.code === 200) setTrends(trendData.data);
      if (studentData.code === 200) setStudents(studentData.data);

    } catch (error) {
      console.error('Teacher Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={[styles.container, styles.centered]}>
      <ActivityIndicator size="large" color="#8B5CF6" />
    </View>
  );

  const tabs = [
    { id: 'overview', icon: BarChart2, label: 'Stats' },
    { id: 'attendance', icon: UserCheck, label: 'Logs' },
    { id: 'academics', icon: BookOpen, label: 'Academic' },
    { id: 'students', icon: Users, label: 'Students' },
    { id: 'admin', icon: ShieldAlert, label: 'Admin', hide: !isPrincipal },
  ];

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.usn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Custom Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {tabs.filter(t => !t.hide).map((tab) => (
          <TouchableOpacity 
            key={tab.id} 
            style={[styles.tabItem, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} color={activeTab === tab.id ? '#8B5CF6' : '#64748B'} />
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ width: 20 }} />
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {activeTab === 'overview' && (
          <>
            <View style={styles.statGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total</Text>
                <Text style={[styles.statValue, { color: '#8B5CF6' }]}>{data?.total_enrolled || 0}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Present</Text>
                <Text style={[styles.statValue, { color: '#10B981' }]}>{data?.present_today || 0}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Absent</Text>
                <Text style={[styles.statValue, { color: '#EF4444' }]}>{data?.absent_today || 0}</Text>
              </View>
            </View>

            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <TrendingUp size={18} color="#8B5CF6" />
                <Text style={styles.cardTitle}>8-Week Trend</Text>
              </View>
              <View style={styles.chartPlaceholder}>
                {trends.map((w, i) => (
                  <View key={i} style={[styles.bar, { height: `${w.percentage}%` }]} />
                ))}
              </View>
              <View style={styles.chartLabels}>
                {trends.map((w, i) => (
                  <Text key={i} style={styles.chartTick}>{w.week}</Text>
                ))}
              </View>
            </View>

            <View style={[styles.glassCard, { backgroundColor: 'rgba(239, 68, 68, 0.05)' }]}>
              <View style={styles.cardHeader}>
                <AlertCircle size={18} color="#EF4444" />
                <Text style={[styles.cardTitle, { color: '#EF4444' }]}>Status Report</Text>
              </View>
              <Text style={styles.alertText}>
                The system is running optimally. {data?.late_today || 0} students recorded as late today.
              </Text>
            </View>
          </>
        )}

        {activeTab === 'attendance' && (
          <>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Quick Attendance</Text>
              <TouchableOpacity style={styles.exportBtn}>
                <Download size={16} color="#06B6D4" />
                <Text style={styles.exportText}>Export</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.glassCard}>
              <Text style={styles.cardSub}>Capture attendance via QR or Face Scan</Text>
              <TouchableOpacity style={[styles.addBtn, { width: '100%', height: 50 }]}>
                <Text style={{ color: '#F8FAFC', fontWeight: 'bold' }}>Launch Scanner</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeTab === 'academics' && (
          <>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Section Management</Text>
              <TouchableOpacity style={styles.addBtn}>
                <Plus size={16} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
            <View style={styles.glassCard}>
              <Text style={styles.cardTitle}>CS501 - Data Structures</Text>
              <Text style={styles.cardSub}>Section A • 5th Semester</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '75%' }]} />
              </View>
              <Text style={styles.progressLabel}>75% Syllabus Completed</Text>
            </View>
          </>
        )}

        {activeTab === 'students' && (
          <>
            <View style={styles.searchBar}>
              <Search size={18} color="#64748B" />
              <TextInput 
                style={styles.searchInput} 
                placeholder="Search by USN or Name" 
                placeholderTextColor="#64748B"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            {filteredStudents.map((s, i) => (
              <TouchableOpacity key={i} style={styles.listCard}>
                <View>
                  <Text style={styles.listName}>{s.name}</Text>
                  <Text style={styles.listSub}>{s.usn} • {s.branch}</Text>
                </View>
                <ChevronRight size={18} color="#475569" />
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'admin' && (
          <>
            <Text style={styles.sectionTitle}>Principal Dashboard</Text>
            <View style={styles.statGrid}>
              <View style={[styles.statCard, { width: '100%' }]}>
                <Text style={styles.statLabel}>Total Fee Collection</Text>
                <Text style={[styles.statValue, { color: '#10B981' }]}>₹42.50 Lakhs</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Audit Log Snippet</Text>
            <View style={styles.glassCard}>
              <Text style={styles.listSub}>Admin User performed STUDENT_ENROLL for 1XX22CS042</Text>
              <Text style={styles.listSub}>Prof. Rao performed ATTENDANCE_MARK for Section A</Text>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  tabBar: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 10,
  },
  activeTab: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  tabLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  activeTabLabel: {
    color: '#8B5CF6',
  },
  scrollContent: {
    padding: 20,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#1E293B',
    width: '31%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  glassCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  chartPlaceholder: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  bar: {
    width: 25,
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
    opacity: 0.6,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 8,
  },
  chartTick: {
    color: '#64748B',
    fontSize: 10,
  },
  alertText: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportText: {
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  listCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  listSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  attBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  addBtn: {
    backgroundColor: '#8B5CF6',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSub: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 12,
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  progressLabel: {
    color: '#94A3B8',
    fontSize: 10,
    textAlign: 'right',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#F8FAFC',
    marginLeft: 12,
    fontSize: 14,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  remindBtn: {
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  remindText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
