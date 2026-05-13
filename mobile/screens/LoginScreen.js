import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ALIAS</Text>
      <Text style={styles.subtitle}>Welcome back</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.replace('StudentDashboard')}
        >
          <Text style={styles.buttonText}>Login as Student</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.teacherButton]}
          onPress={() => navigation.replace('TeacherDashboard')}
        >
          <Text style={styles.buttonText}>Login as Teacher</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#8B5CF6',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 40,
    marginTop: 10,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 15,
  },
  button: {
    backgroundColor: '#06B6D4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  teacherButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  buttonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
});
