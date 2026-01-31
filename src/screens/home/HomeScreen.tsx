import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Platform 
} from 'react-native';
import { Upload, Sparkles, Users, Menu } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color="#fff" size={22} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Audit</Text>
        <View style={{ width: 22 }} /> 
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Badge - Scaled Down */}
        <View style={styles.aiBadge}>
          <Sparkles color="#818cf8" size={12} />
          <Text style={styles.aiBadgeText}>AI-Powered Ad Analysis</Text>
        </View>

        {/* Hero Section - Reduced Font Sizes & Spacing */}
        <Text style={styles.heroTitle}>
          Optimize Your Ads with{'\n'}
          <Text style={styles.heroHighlight}>Intelligent Insights</Text>
        </Text>
        <Text style={styles.heroSub}>
          Upload your ad creative and get instant AI-powered feedback on visuals and copy effectiveness.
        </Text>

        {/* Upload Zone - Slightly Slimmer */}
        <TouchableOpacity style={styles.uploadContainer} activeOpacity={0.8}>
          <LinearGradient
            colors={['rgba(79, 70, 229, 0.08)', 'rgba(15, 23, 42, 0.5)']}
            style={styles.uploadInner}
          >
            <View style={styles.iconCircle}>
              <Upload color="#818cf8" size={28} />
            </View>
            <Text style={styles.uploadText}>Upload ad creative</Text>
            <Text style={styles.uploadSubText}>Drag & drop or click to browse</Text>
            <Text style={styles.fileHint}>PNG, JPG up to 10MB</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Form Section - Tighter Layout */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Target Audience</Text>
          <View style={styles.inputWrapper}>
            <Users color="#64748b" size={18} />
            <TextInput 
              style={styles.input}
              placeholder="e.g., Young professionals aged 25-35"
              placeholderTextColor="#475569"
            />
          </View>
          <Text style={styles.helper}>Describe who you want to reach</Text>

          <TouchableOpacity style={styles.primaryBtn}>
            <Sparkles color="#fff" size={18} />
            <Text style={styles.primaryBtnText}>Start Audit</Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>Upload an image to begin</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#020617' 
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  topBarTitle: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  scrollContent: { 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10,
    paddingBottom: 40 
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(129, 140, 248, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.15)',
    marginBottom: 20,
  },
  aiBadgeText: { 
    color: '#818cf8', 
    fontSize: 11, 
    fontWeight: '600', 
    marginLeft: 5 
  },
  heroTitle: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#fff', 
    textAlign: 'center', 
    lineHeight: 32 
  },
  heroHighlight: { 
    color: '#c084fc' 
  },
  heroSub: { 
    color: '#94a3b8', 
    textAlign: 'center', 
    marginTop: 12, 
    lineHeight: 18, 
    fontSize: 13,
    paddingHorizontal: 10 
  },
  uploadContainer: {
    width: '100%',
    height: 200, // Reduced from 240
    marginTop: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadInner: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  iconCircle: {
    width: 54,
    height: 54,
    backgroundColor: 'rgba(129, 140, 248, 0.12)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '700' 
  },
  uploadSubText: { 
    color: '#94a3b8', 
    fontSize: 12, 
    marginTop: 2 
  },
  fileHint: { 
    color: '#475569', 
    fontSize: 10, 
    marginTop: 10 
  },
  formContainer: { 
    width: '100%', 
    marginTop: 24 
  },
  label: { 
    color: '#fff', 
    fontSize: 13, 
    fontWeight: '600', 
    marginBottom: 8 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    height: 48, // Slimmer input
    gap: 10,
  },
  input: { 
    flex: 1, 
    color: '#fff', 
    fontSize: 13 
  },
  helper: { 
    color: '#475569', 
    fontSize: 11, 
    marginTop: 6 
  },
  primaryBtn: {
    backgroundColor: '#4f46e5',
    height: 50, // Slimmer button
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  primaryBtnText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '700' 
  },
  footerNote: { 
    color: '#475569', 
    fontSize: 11, 
    textAlign: 'center', 
    marginTop: 14 
  },
});