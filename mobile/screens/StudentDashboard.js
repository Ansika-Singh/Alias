import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { 
  TrendingUp, BookOpen, Calendar, User, 
  Award, Flame, Clock, ChevronRight,
  FlaskConical, Megaphone, CreditCard, ShieldAlert
} from 'lucide-react-native';
import { get, getAuth } from '../utils/api';

const { width } = Dimensions.get('window');

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await get(`/student-portal/${auth.usn}/dashboard`);
      const result = await response.json();
      if (result.code === 200) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={[styles.container, styles.centered]}>
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text style={styles.loadingText}>Fetching your portal...</Text>
    </View>
  );

  if (error) return (
    <View style={[styles.container, styles.centered]}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const tabs = [
    { id: 'overview', icon: TrendingUp, label: 'Stats' },
    { id: 'study', icon: BookOpen, label: 'Study' },
    { id: 'campus', icon: Calendar, label: 'Campus' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity 
            key={tab.id} 
            style={[styles.tabItem, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <tab.icon size={20} color={activeTab === tab.id ? '#8B5CF6' : '#64748B'} />
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {activeTab === 'overview' && (
          <>
            <View style={styles.heroCard}>
              <View style={styles.streakBadge}>
                <Flame size={14} color="#F97316" fill="#F97316" />
                <Text style={styles.streakText}>{data?.gamification?.streakCount || 0} Day Streak</Text>
              </View>
              <View style={styles.ringContainer}>
                <View style={styles.ring}>
                  <Text style={styles.percentage}>{data?.attendance?.percentage || 0}%</Text>
                  <Text style={styles.percentageLabel}>Attendance</Text>
                </View>
              </View>
              <View style={styles.pointsBadge}>
                <Award size={16} color="#FACC15" />
                <Text style={styles.pointsText}>{data?.gamification?.points || 0} Points</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Classes</Text>
            {data?.recent_logs?.map((item, index) => (
              <View key={index} style={styles.historyCard}>
                <View>
                  <Text style={styles.subjectName}>{item.subject}</Text>
                  <Text style={styles.date}>{new Date(item.entryTimestamp).toLocaleDateString()}</Text>
                </View>
                <View style={[
                  styles.badge, 
                  item.status === 'PRESENT' ? styles.badgePresent : styles.badgeLate
                ]}>
                  <Text style={[
                    styles.badgeText,
                    item.status === 'PRESENT' ? styles.textPresent : styles.textLate
                  ]}>{item.status}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === 'study' && (
          <>
            <Text style={styles.sectionTitle}>Upcoming Assignments</Text>
            <View style={styles.academicCard}>
              <View style={styles.academicIcon}>
                <BookOpen size={20} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>MapReduce Implementation</Text>
                <Text style={styles.cardSub}>CS501 • Due: Tomorrow</Text>
              </View>
              <View style={[styles.statusTag, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                <Text style={[styles.statusText, { color: '#F97316' }]}>PENDING</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Lab Progress</Text>
            <View style={styles.academicCard}>
              <View style={styles.academicIcon}>
                <FlaskConical size={20} color="#06B6D4" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Computer Networks Lab</Text>
                <Text style={styles.cardSub}>10 Experiments Completed</Text>
              </View>
              <ChevronRight size={16} color="#475569" />
            </View>
          </>
        )}

        {activeTab === 'campus' && (
          <>
            <Text style={styles.sectionTitle}>Notice Board</Text>
            <View style={styles.announcementCard}>
              <View style={[styles.annIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Megaphone size={20} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>End Semester Exam Schedule</Text>
                <Text style={styles.cardSub}>Exam • 15 May</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Financial Summary</Text>
            <View style={styles.academicCard}>
              <View style={styles.academicIcon}>
                <CreditCard size={20} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Annual Fees</Text>
                <Text style={styles.cardSub}>₹25,000 Outstanding</Text>
              </View>
              <TouchableOpacity style={styles.payBtn}>
                <Text style={styles.payBtnText}>Pay</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeTab === 'profile' && (
          <View style={styles.profileContainer}>
            <View style={styles.idCard}>
              <View style={styles.idHeader}>
                <Text style={styles.collegeName}>CAMBRIDGE INSTITUTE</Text>
                <ShieldAlert size={20} color="#F8FAFC" />
              </View>
              <View style={styles.idBody}>
                <View style={styles.idPhoto} />
                <View>
                  <Text style={styles.idName}>{data?.student?.name}</Text>
                  <Text style={styles.idUsn}>{data?.student?.usn}</Text>
                  <Text style={styles.idDept}>{data?.student?.branch} Dept.</Text>
                  <Text style={styles.idDept}>Sem {data?.student?.semester}</Text>
                </View>
              </View>
              <View style={styles.idFooter}>
                <Text style={styles.idRole}>STUDENT IDENTITY CARD</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.settingsItem}>
              <User size={20} color="#94A3B8" />
              <Text style={styles.settingsLabel}>Personal Information</Text>
              <ChevronRight size={16} color="#475569" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem}>
              <ShieldAlert size={20} color="#94A3B8" />
              <Text style={styles.settingsLabel}>Logout</Text>
              <ChevronRight size={16} color="#475569" />
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  tabLabel: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 4,
    fontWeight: 'bold',
  },
  activeTabLabel: {
    color: '#8B5CF6',
  },
  scrollContent: {
    padding: 20,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  streakText: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  ringContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ring: {
    alignItems: 'center',
  },
  percentage: {
    color: '#F8FAFC',
    fontSize: 36,
    fontWeight: 'bold',
  },
  percentageLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    color: '#FACC15',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  subjectName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    color: '#64748B',
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgePresent: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  badgeLate: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  textPresent: { color: '#10B981', fontWeight: 'bold', fontSize: 12 },
  textLate: { color: '#F59E0B', fontWeight: 'bold', fontSize: 12 },
  academicCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  academicIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  cardSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  announcementCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  annIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  payBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payBtnText: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 12,
  },
  profileContainer: {
    alignItems: 'center',
  },
  idCard: {
    width: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  idHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  collegeName: {
    color: '#F8FAFC',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  idBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  idPhoto: {
    width: 80,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    marginRight: 20,
  },
  idName: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  idUsn: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  idDept: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  idFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 10,
    alignItems: 'center',
  },
  idRole: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#1E293B',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
  },
  settingsLabel: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    marginLeft: 15,
  }
});
