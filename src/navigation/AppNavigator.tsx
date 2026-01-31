// AppNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/home/HomeScreen';
// import ProfileScreen from '../screens/home/ProfileScreen'; // Keep if used
import HistoryScreen from '../screens/home/HistoryScreen'; 
import CustomSidebar from '../screens/home/CustomSidebar';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuditHome" component={HomeScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomSidebar {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { 
          backgroundColor: '#020617', 
          width: '80%', // Responsive width
        },
        // FIX: This ensures the drawer overlays the screen
        drawerType: 'front', 
        overlayColor: 'rgba(0,0,0,0.7)', // Dims the background
      }}
    >
      <Drawer.Screen name="Audit" component={HomeStack} />
      <Drawer.Screen name="History" component={HistoryScreen} />
      {/* Settings Screen Placeholder */}
      <Drawer.Screen name="Settings" component={HistoryScreen} /> 
    </Drawer.Navigator>
  );
}