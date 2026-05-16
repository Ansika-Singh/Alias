import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput, ActivityIndicator, Alert } from 'react-native';
import { User, Lock, Zap } from 'lucide-react-native';
import { login, setAuth } from '../utils/api';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await login(username, password);
      const data = await response.json();

      if (response.status === 200) {
        setAuth(data.access_token, data.role, data.name, username);
        
        // Redirect based on role
        if (data.role === 'student') navigation.replace('StudentDashboard');
        else if (data.role === 'parent') navigation.replace('ParentDashboard');
        else navigation.replace('TeacherDashboard');
      } else {
        Alert.alert('Login Failed', data.detail || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <Zap size={40} color="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
        </View>
        <Text style={styles.title}>ALIAS</Text>
        <Text style={styles.subtitle}>Automated Live Identification & Attendance System</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <User size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username / USN"
            placeholderTextColor="#64748B"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Lock size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password / PIN"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#F8FAFC" /> : <Text style={styles.loginBtnText}>Sign In</Text>}
        </TouchableOpacity>
        
        <View style={styles.helpLinks}>
          <Text style={styles.helpText}>Forgot Password?</Text>
          <Text style={styles.helpText}>Help Center</Text>
        </View>
      </View>

      <Text style={styles.footer}>© 2026 ALIAS Enterprise • v1.2.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 250,
    lineHeight: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  formContainer: {
    width: '100%',
    gap: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#F8FAFC',
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: '#8B5CF6',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtnText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 5,
  },
  helpText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    color: '#334155',
    fontSize: 12,
    fontWeight: '500',
  }
});
