import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Dimensions, Modal, TextInput, ActivityIndicator, Alert 
} from 'react-native';
import { 
  ShieldCheck, Clock, Calendar, MessageSquare, 
  ChevronRight, AlertCircle, Phone, Mail, Send
} from 'lucide-react-native';
import { get, getAuth, post } from '../utils/api';

const { width } = Dimensions.get('window');

export default function ParentDashboard() {
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const SectionHeader = ({ title, icon: Icon }) => (
    <View style={styles.sectionHeader}>
      <Icon size={20} color="#8B5CF6" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header / Profile Card */}
        <View style={styles.headerCard}>
          <View style={styles.parentBadge}>
            <Eye size={12} color="#94A3B8" />
            <Text style={styles.parentBadgeText}>Parent View • Read Only</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Users size={30} color="#8B5CF6" />
            </View>
            <View>
              <Text style={styles.childName}>{MOCK_CHILD.name}</Text>
              <Text style={styles.childUsn}>{MOCK_CHILD.usn} • CSE • Sem 6</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{MOCK_CHILD.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{MOCK_CHILD.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>
        </View>

        {/* Attendance Summary */}
        <SectionHeader title="Attendance Health" icon={TrendingUp} />
        <View style={styles.glassCard}>
          <View style={styles.attRow}>
            <View style={styles.ringContainer}>
              <View style={[styles.ring, { borderColor: MOCK_CHILD.attendance < 75 ? '#EF4444' : '#10B981' }]}>
                <Text style={styles.attPercent}>{MOCK_CHILD.attendance}%</Text>
              </View>
            </View>
            <View style={styles.attInfo}>
              <Text style={styles.attStatus}>
                {MOCK_CHILD.attendance < 75 ? '⚠️ Action Required' : '✅ Good Standing'}
              </Text>
              <Text style={styles.attSub}>98/120 Classes attended</Text>
              <TouchableOpacity style={styles.fullReportBtn}>
                <Text style={styles.fullReportText}>View Full History</Text>
                <ChevronRight size={14} color="#06B6D4" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Classes */}
        <SectionHeader title="Recent Classes" icon={Clock} />
        {MOCK_CHILD.recentClasses.map((item, idx) => (
          <View key={idx} style={styles.classCard}>
            <View>
              <Text style={styles.className}>{item.subject}</Text>
              <Text style={styles.classTime}>{item.time}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'PRESENT' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
              <Text style={[styles.statusText, { color: item.status === 'PRESENT' ? '#10B981' : '#EF4444' }]}>{item.status}</Text>
            </View>
          </View>
        ))}

        {/* Actions Section */}
        <SectionHeader title="Quick Actions" icon={MessageSquare} />
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => setShowLeaveModal(true)}>
            <Calendar size={24} color="#06B6D4" />
            <Text style={styles.actionLabel}>Apply Leave</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Phone size={24} color="#10B981" />
            <Text style={styles.actionLabel}>Call Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Mail size={24} color="#8B5CF6" />
            <Text style={styles.actionLabel}>Email HOD</Text>
          </TouchableOpacity>
        </View>

        {/* Academic Overview */}
        <SectionHeader title="Academic Snapshot" icon={BookOpen} />
        <View style={styles.glassCard}>
          <View style={styles.academicRow}>
            <BookOpen size={18} color="#94A3B8" />
            <Text style={styles.academicText}>Assignments: 2 Pending</Text>
          </View>
          <View style={styles.academicRow}>
            <FlaskConical size={18} color="#94A3B8" />
            <Text style={styles.academicText}>Labs: 10/12 Completed</Text>
          </View>
          <View style={styles.academicRow}>
            <CreditCard size={18} color="#94A3B8" />
            <Text style={styles.academicText}>Fees: ₹25,000 Outstanding</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Leave Modal */}
      <Modal visible={showLeaveModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Apply for Leave</Text>
            <Text style={styles.modalSub}>Application for {MOCK_CHILD.name}</Text>
            
            <TextInput style={styles.input} placeholder="Start Date (DD-MM-YYYY)" placeholderTextColor="#64748B" />
            <TextInput style={styles.input} placeholder="End Date (DD-MM-YYYY)" placeholderTextColor="#64748B" />
            <TextInput style={[styles.input, { height: 100 }]} multiline placeholder="Reason for leave..." placeholderTextColor="#64748B" />
            
            <TouchableOpacity style={styles.submitBtn} onPress={() => { alert('Leave Application Submitted!'); setShowLeaveModal(false); }}>
              <Text style={styles.submitBtnText}>Submit Application</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLeaveModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
  },
  headerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  parentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  parentBadgeText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  childName: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: 'bold',
  },
  childUsn: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  glassCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  attRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ringContainer: {
    marginRight: 20,
  },
  ring: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attPercent: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  attInfo: {
    flex: 1,
  },
  attStatus: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  attSub: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  fullReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  fullReportText: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  classCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  className: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  classTime: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: '#1E293B',
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionLabel: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  academicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  academicText: {
    color: '#94A3B8',
    fontSize: 14,
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalSub: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 25,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    color: '#F8FAFC',
    marginBottom: 15,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#8B5CF6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    padding: 15,
    alignItems: 'center',
    marginTop: 5,
  },
  cancelText: {
    color: '#64748B',
    fontSize: 14,
  }
});
