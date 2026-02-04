import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { LayoutDashboard, History, Settings, LogOut, Zap, ChevronLeft } from 'lucide-react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfileByIdApi } from '../../services/api';

export default function CustomSidebar(props: DrawerContentComponentProps) {
  const { navigation, state } = props;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const activeRouteName = state.routes[state.index].name;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          const res = await getProfileByIdApi(id);
          setUser(res.data);
        }
      } catch (e) {
        console.error("Sidebar Profile Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };

    // Refetch when the sidebar is opened or active route changes
    fetchUser();
  }, [activeRouteName]);

  const handleSignOut = async () => {
    try {
      // Specifically remove the userId or clear everything
      await AsyncStorage.removeItem('userId'); 
      await AsyncStorage.clear(); 
      
      // Reset navigation stack to Login to prevent back-button access
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (e) {
      console.error("Logout Error:", e);
    }
  };

  const menuItems = [
    { label: 'Audit', icon: LayoutDashboard, route: 'Audit' },
    { label: 'History', icon: History, route: 'History' },
    { label: 'Settings', icon: Settings, route: 'Settings' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox}><Zap color="#fff" size={18} fill="#fff" /></View>
          <View><Text style={styles.brandText}>AdVantage</Text></View>
        </View>
        <TouchableOpacity onPress={() => navigation.closeDrawer()}>
            <ChevronLeft color="#475569" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.menu}>
        {menuItems.map((item) => {
          const isActive = activeRouteName === item.route;
          return (
            <TouchableOpacity 
                key={item.label} 
                style={[styles.navItem, isActive && styles.activeNav]} 
                onPress={() => navigation.navigate(item.route)}
            >
              <item.icon color={isActive ? '#fff' : '#94a3b8'} size={20} />
              <Text style={[styles.navText, isActive && styles.activeText]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator color="#22d3ee" style={{ marginBottom: 15 }} />
        ) : (
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
            <View>
              <Text style={styles.userName} numberOfLines={1}>{user?.name || "Guest"}</Text>
              <Text style={styles.userPlan}>Quota: {user?.quota?.remaining ?? 0}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
          <LogOut color="#ef4444" size={18} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoBox: { backgroundColor: '#4f46e5', padding: 8, borderRadius: 10 },
    brandText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    menu: { flex: 1, paddingHorizontal: 15 },
    navItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, gap: 12 },
    activeNav: { backgroundColor: '#1e293b' },
    navText: { color: '#94a3b8', fontSize: 15 },
    activeText: { color: '#fff', fontWeight: 'bold' },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#0f172a' },
    userCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#111827', padding: 12, borderRadius: 16, marginBottom: 15 },
    avatar: { width: 40, height: 40, backgroundColor: '#7c3aed', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontWeight: 'bold' },
    userName: { color: '#fff', fontSize: 14, fontWeight: '600', maxWidth: 120 },
    userPlan: { color: '#64748b', fontSize: 11 },
    signOut: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 5 },
    signOutText: { color: '#ef4444', fontWeight: 'bold' }
});