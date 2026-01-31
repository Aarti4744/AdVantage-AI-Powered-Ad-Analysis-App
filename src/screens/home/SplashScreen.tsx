import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing, 
  StatusBar,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScanEye, Cpu, ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }: any) => {
  const scanLineY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Scanning & Rotation logic
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, {
          toValue: 140,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#020617']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.mainContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.visualContainer}>
          {/* Rotating Outer Ring */}
          <Animated.View style={[styles.outerRing, { transform: [{ rotate: spin }] }]}>
             <View style={styles.ringDot} />
          </Animated.View>

          {/* New Modern Scanner Icon */}
          <View style={styles.iconBox}>
            <ScanEye color="#22d3ee" size={120} strokeWidth={1} />
            <View style={styles.innerIcon}>
               <Cpu color="#818cf8" size={40} />
            </View>
            
            {/* The Scanning Laser */}
            <Animated.View style={[styles.laser, { transform: [{ translateY: scanLineY }] }]}>
              <LinearGradient
                colors={['transparent', '#22d3ee', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.laserGradient}
              />
            </Animated.View>
          </View>
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.brandName}>
            AD<Text style={styles.accentText}>VANTAGE</Text>
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>NEURAL ENGINE ACTIVE</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <ShieldCheck color="#475569" size={14} />
        <Text style={styles.footerText}> ENCRYPTED BY ADVANTAGE AI</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617' },
  mainContent: { alignItems: 'center', width: '100%' },
  visualContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  outerRing: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)', borderStyle: 'dashed' },
  ringDot: { position: 'absolute', top: -4, left: '50%', width: 8, height: 8, borderRadius: 4, backgroundColor: '#22d3ee' },
  iconBox: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  innerIcon: { position: 'absolute', opacity: 0.6 },
  laser: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 10 },
  laserGradient: { flex: 1, width: '100%', shadowColor: '#22d3ee', shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  textWrapper: { alignItems: 'center' },
  brandName: { fontSize: 42, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  accentText: { color: '#818cf8', fontWeight: '300' },
  badge: { marginTop: 15, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(129, 140, 248, 0.1)', borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.2)' },
  badgeText: { fontSize: 10, color: '#818cf8', fontWeight: 'bold', letterSpacing: 1.5 },
  footer: { position: 'absolute', bottom: 40, flexDirection: 'row', alignItems: 'center' },
  footerText: { color: '#475569', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
});

export default SplashScreen;