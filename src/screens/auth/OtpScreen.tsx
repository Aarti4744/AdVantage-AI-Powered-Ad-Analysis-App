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
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, Fingerprint, ArrowLeft, MailCheck } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure this is installed
import Button from '../../components/Button';
import { ROUTES } from '../../constants/routes';
import { verifyOtpApi, loginApi, signUpApi } from '../../services/api';

const { width } = Dimensions.get('window');

export default function OtpScreen({ navigation, route }: any) {
  // Params passed from LoginScreen
  const userEmail = route?.params?.email || "";
  const authType = route?.params?.type || "signin"; // 'signin' or 'signup'
  const userName = route?.params?.name || ""; // only for signup resend
  
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60); 
  const [loading, setLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();

    // Countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  /**
   * VERIFY OTP LOGIC
   * Matches Postman: POST /api/v1/auth/verify-otp
   */
  const handleVerify = async () => {
    if (otp.length < 6) return;

    try {
      setLoading(true);
      
      const response = await verifyOtpApi({
        email: userEmail,
        otp: otp
      });

      console.log("Verification Success:", response.data);

      // 1. Extract the ID from the response (matches your verify_otp screenshot)
      const userId = response.data.user.id;

      // 2. Save the ID locally so the Sidebar can fetch user details
      await AsyncStorage.setItem('userId', userId.toString());

      // 3. Success Redirect
      navigation.replace('MainApp', { screen: ROUTES.HOME });
      
    } catch (error: any) {
      console.log("Verify Error:", error?.response?.data);
      const errorMsg = error?.response?.data?.message || "Invalid security code. Please check and try again.";
      Alert.alert("Verification Failed", errorMsg);
      setOtp(''); // Reset input
    } finally {
      setLoading(false);
    }
  };

  /**
   * RESEND CODE LOGIC
   * Switches between login/signup APIs based on route type
   */
  const handleResend = async () => {
    try {
      setLoading(true);
      if (authType === 'signup') {
        await signUpApi({ name: userName, email: userEmail });
      } else {
        await loginApi({ email: userEmail });
      }
      setTimer(60);
      Alert.alert("Sent", "A new security protocol has been dispatched to your email.");
    } catch (error: any) {
      Alert.alert("Error", "Failed to resend protocol.");
    } finally {
      setLoading(false);
    }
  };

  // Render the 6 individual boxes for visual OTP
  const renderDigits = () => {
    const digits = otp.split('');
    return [0, 1, 2, 3, 4, 5].map((index) => (
      <View 
        key={index} 
        style={[
          styles.digitBox, 
          otp.length === index && styles.digitBoxActive,
          otp.length > index && styles.digitBoxFilled
        ]}
      >
        <Text style={styles.digitText}>{digits[index] || ''}</Text>
        {otp.length === index && <View style={styles.cursor} />}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#020617']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity 
           style={styles.backButton} 
           onPress={() => navigation.goBack()}
           disabled={loading}
        >
          <ArrowLeft color="#94a3b8" size={24} />
        </TouchableOpacity>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
            <View style={styles.iconWrapper}>
              <ShieldCheck color="#22d3ee" size={42} strokeWidth={1.5} />
              <View style={styles.glow} />
            </View>

            <Text style={styles.title}>Verify Identity</Text>
            
            <View style={styles.emailBadge}>
              <MailCheck color="#818cf8" size={16} />
              <Text style={styles.emailText}>{userEmail}</Text>
            </View>

            <Text style={styles.subtitle}>
              Secure 6-digit synchronization code has been dispatched to your neural-linked email.
            </Text>

            <View style={styles.otpWrapper}>
              <View style={styles.digitContainer}>{renderDigits()}</View>
              {/* Invisible input that powers the UI boxes */}
              <TextInput
                style={styles.hiddenInput}
                value={otp}
                onChangeText={(val) => val.length <= 6 && setOtp(val.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus={true}
                editable={!loading}
              />
            </View>

            <View style={styles.resendSection}>
              <Text style={styles.resendText}>Protocol expires in </Text>
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button 
                title={loading ? "Synchronizing..." : "Authorize Access"} 
                onPress={handleVerify} 
                loading={loading}
                disabled={otp.length < 6 || loading}
              />
            </View>

            <TouchableOpacity 
              style={styles.resendBtn} 
              disabled={timer > 0 || loading}
              onPress={handleResend}
            >
              <Text style={[styles.resendBtnText, timer > 0 && styles.disabledText]}>
                {timer > 0 ? 'Encrypted Link Active' : 'Resend Security Protocol'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>

        <View style={styles.footer}>
          <Fingerprint color="#475569" size={20} style={{ marginBottom: 8 }} />
          <Text style={styles.legalText}>AD-VANTAGE NEURAL ENCRYPTION v4.2</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  backButton: { marginTop: 10, width: 40, height: 40 },
  content: { flex: 1, justifyContent: 'center' },
  
  iconWrapper: {
    width: 70, height: 70, borderRadius: 20,
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  glow: {
    position: 'absolute', width: 30, height: 30,
    backgroundColor: '#22d3ee', borderRadius: 15,
    opacity: 0.15, transform: [{ scale: 2.5 }],
  },
  title: { fontSize: 28, fontWeight: '800', color: '#ffffff', letterSpacing: 1, marginBottom: 16 },
  emailBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.2)', marginBottom: 20,
  },
  emailText: { color: '#818cf8', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 20, paddingHorizontal: 20, marginBottom: 40 },

  otpWrapper: { width: '100%', alignItems: 'center', marginBottom: 32 },
  digitContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  digitBox: {
    width: width * 0.13, height: 60,
    backgroundColor: 'rgba(15, 23, 42, 0.58)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  digitBoxActive: {
    borderColor: '#22d3ee', backgroundColor: 'rgba(34, 211, 238, 0.05)',
    shadowColor: '#22d3ee', shadowOpacity: 0.2, shadowRadius: 5,
  },
  digitBoxFilled: { borderColor: 'rgba(129, 140, 248, 0.5)' },
  digitText: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  cursor: { position: 'absolute', bottom: 12, width: 15, height: 2, backgroundColor: '#22d3ee' },
  hiddenInput: { ...StyleSheet.absoluteFillObject, opacity: 0 },

  resendSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  resendText: { color: '#64748b', fontSize: 14 },
  timerText: { 
    color: '#22d3ee', fontWeight: '700', fontSize: 14, 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
  },
  buttonContainer: { width: '100%', marginBottom: 20 },
  resendBtn: { padding: 10 },
  resendBtnText: { color: '#22d3ee', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  disabledText: { color: '#475569', fontWeight: '400' },
  footer: { alignItems: 'center', paddingBottom: 20 },
  legalText: { fontSize: 10, color: '#475569', letterSpacing: 1 },
});