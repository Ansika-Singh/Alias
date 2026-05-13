import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const MOCK_HISTORY = [
  { subject: 'Data Structures', date: 'Today', status: 'PRESENT' },
  { subject: 'Operating Systems', date: 'Today', status: 'LATE' },
  { subject: 'Algorithms', date: 'Yesterday', status: 'PRESENT' },
];

export default function StudentDashboard() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Overall Attendance</Text>
        <View style={styles.ring}>
          <Text style={styles.percentage}>85%</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.leaveButton}>
        <Text style={styles.leaveButtonText}>+ Apply for Leave</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Classes</Text>
      
      {MOCK_HISTORY.map((item, index) => (
        <View key={index} style={styles.historyCard}>
          <View>
            <Text style={styles.subjectName}>{item.subject}</Text>
            <Text style={styles.date}>{item.date}</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  progressCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  progressLabel: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 16,
  },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: '#06B6D4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  leaveButtonText: {
    color: '#06B6D4',
    fontWeight: '600',
    fontSize: 16,
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
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  date: {
    color: '#94A3B8',
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgePresent: { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
  badgeLate: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
  textPresent: { color: '#10B981', fontWeight: '600', fontSize: 12 },
  textLate: { color: '#F59E0B', fontWeight: '600', fontSize: 12 },
});
