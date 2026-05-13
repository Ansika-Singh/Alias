import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const MOCK_NOTIFICATIONS = [
  { message: 'Alex Johnson was absent for Data Structures.', time: '10 mins ago' },
  { message: 'Michael Chang was absent for Data Structures.', time: '10 mins ago' },
];

const MOCK_PERIODS = [
  { subject: 'Data Structures', section: 'A', stats: '38/40 Present' },
];

export default function TeacherDashboard() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
      
      {MOCK_NOTIFICATIONS.map((item, index) => (
        <View key={index} style={styles.alertCard}>
          <Text style={styles.alertText}>{item.message}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Your Periods Today</Text>
      
      {MOCK_PERIODS.map((item, index) => (
        <View key={index} style={styles.periodCard}>
          <View>
            <Text style={styles.subjectName}>{item.subject}</Text>
            <Text style={styles.sectionName}>Section {item.section}</Text>
          </View>
          <Text style={styles.stats}>{item.stats}</Text>
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
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertText: {
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  timeText: {
    color: '#EF4444',
    fontSize: 12,
  },
  periodCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  subjectName: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionName: {
    color: '#94A3B8',
    fontSize: 14,
  },
  stats: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
});
