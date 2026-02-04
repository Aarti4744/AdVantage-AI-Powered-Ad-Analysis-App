import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScanEye, Cpu, Mail, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Added this
import { ROUTES } from '../../constants/routes';
import { loginApi, signUpApi } from '../../services/api';
import Button from '../Button';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const tabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start();

    Animated.timing(tabAnim, {
      toValue: activeTab === 'signin' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const tabTranslateX = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.46],
  });

  const handleAuth = async () => {
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();

    if (!sanitizedEmail) {
      Alert.alert("Required", "Please enter your email address");
      return;
    }

    if (activeTab === 'signup' && !sanitizedName) {
      Alert.alert("Required", "Please enter your full name");
      return;
    }

    try {
      setLoading(true);
      let response;

      if (activeTab === 'signin') {
        response = await loginApi({ email: sanitizedEmail });
        
        // --- STORAGE LOGIC ---
        // Assuming your API returns user object with id: { user: { id: 123 ... } } or { id: 123 }
        const userId = response.data?.user?.id || response.data?.id;
        console.log("Login Response:", userId);
        if (userId) {
          await AsyncStorage.setItem('userId', userId.toString());
        }

        navigation.navigate(ROUTES.OTP, { email: sanitizedEmail, type: 'signin' });
      } else {
        response = await signUpApi({ name: sanitizedName, email: sanitizedEmail });
        
        // --- STORAGE LOGIC ---
        const userId = response.data?.user?.id || response.data?.id;
        if (userId) {
          await AsyncStorage.setItem('userId', userId.toString());
        }

        navigation.navigate(ROUTES.OTP, { 
          email: sanitizedEmail, 
          type: 'signup', 
          name: sanitizedName 
        });
      }
    } catch (error: any) {
      console.log("Auth Error:", error?.response?.data || error.message);
      const errorMessage = error?.response?.data?.message || "Internal server connection failed.";
      Alert.alert("Authentication Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#020617']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.iconWrapper}>
            <ScanEye color="#22d3ee" size={52} strokeWidth={1.4} />
            <View style={styles.miniCpu}><Cpu color="#818cf8" size={20} strokeWidth={1.5} /></View>
          </View>
          <Text style={styles.brandTitle}>AD<Text style={styles.brandHighlight}>VANTAGE</Text></Text>
          <View style={styles.badge}><Text style={styles.badgeText}>AI MARKETING INTELLIGENCE</Text></View>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.tabContainer}>
            <Animated.View style={[styles.tabIndicatorBackground, { transform: [{ translateX: tabTranslateX }] }]} />
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('signin')}>
                <Text style={[styles.tabText, activeTab === 'signin' && styles.activeTabText]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('signup')}>
                <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {activeTab === 'signup' && (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Full Name</Text>
                <View style={[styles.inputContainer, isNameFocused && styles.inputFocused]}>
                  <User color="#818cf8" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your name"
                    placeholderTextColor="#94a3b8"
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                    onFocus={() => setIsNameFocused(true)}
                    onBlur={() => setIsNameFocused(false)}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, isEmailFocused && styles.inputFocused]}>
                <Mail color="#818cf8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@company.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button 
                title={loading ? 'Processing...' : activeTab === 'signin' ? 'Generate Access OTP' : 'Initialize Account'} 
                onPress={handleAuth} 
                loading={loading}
                disabled={loading}
              />
            </View>

            <TouchableOpacity 
                style={styles.switchLink} 
                onPress={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
            >
              <Text style={styles.footerLinkText}>
                {activeTab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.linkAction}>{activeTab === 'signin' ? 'Sign Up' : 'Sign In'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    header: { alignItems: 'center', marginBottom: 32 },
    iconWrapper: { position: 'relative', marginBottom: 16, width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
    miniCpu: { position: 'absolute', bottom: 4, right: 4, opacity: 0.7 },
    brandTitle: { fontSize: 36, fontWeight: '800', color: '#ffffff', letterSpacing: 2.5 },
    brandHighlight: { color: '#818cf8', fontWeight: '300' },
    badge: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(34, 211, 238, 0.08)', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.25)' },
    badgeText: { fontSize: 10, color: '#22d3ee', fontWeight: '700', letterSpacing: 1.4 },
    card: { width: width * 0.92, backgroundColor: 'rgba(30, 41, 59, 0.24)', borderRadius: 36, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.09)', overflow: 'hidden' },
    tabContainer: { flexDirection: 'row', height: 64, position: 'relative' },
    tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabText: { fontSize: 16, fontWeight: '600', color: '#94a3b8' },
    activeTabText: { color: '#ffffff' },
    tabIndicatorBackground: { position: 'absolute', bottom: 0, width: '50%', height: 3, backgroundColor: '#22d3ee', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
    formContainer: { padding: 32, paddingTop: 20 },
    inputWrapper: { marginBottom: 24 },
    label: { fontSize: 13.5, fontWeight: '600', color: '#94a3b8', marginBottom: 8, marginLeft: 4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.58)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', height: 54, overflow: 'hidden' },
    inputIcon: { marginLeft: 16 },
    textInput: { flex: 1, color: '#f1f5f9', fontSize: 16, paddingHorizontal: 12 },
    inputFocused: { borderColor: 'rgba(34, 211, 238, 0.5)', backgroundColor: 'rgba(15, 23, 42, 0.72)', shadowColor: '#22d3ee', shadowOpacity: 0.3, shadowRadius: 10 },
    buttonContainer: { marginTop: 16 },
    switchLink: { marginTop: 20, alignItems: 'center' },
    footerLinkText: { fontSize: 14.5, color: '#64748b' },
    linkAction: { color: '#22d3ee', fontWeight: '700' },
});