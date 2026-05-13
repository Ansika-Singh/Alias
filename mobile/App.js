import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './screens/LoginScreen';
import StudentDashboard from './screens/StudentDashboard';
import TeacherDashboard from './screens/TeacherDashboard';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F172A', // Deep Slate
          },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: { backgroundColor: '#0F172A' }
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="StudentDashboard" 
          component={StudentDashboard} 
          options={{ title: 'My Attendance', headerBackVisible: false }} 
        />
        <Stack.Screen 
          name="TeacherDashboard" 
          component={TeacherDashboard} 
          options={{ title: "Today's Classes", headerBackVisible: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
