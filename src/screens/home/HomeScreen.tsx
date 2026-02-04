import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Upload, Sparkles, Users, Menu, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importing your existing setup
import api, { APIKEY, fetchS3ImageUrlApi, processAuditApi } from '../../services/api'; 

export default function HomeScreen({ navigation }: any) {
  const [image, setImage] = useState<string | null>(null);
  const [audience, setAudience] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleStartAudit = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    try {
      setIsSubmitting(true);
      setLoadingMessage("Checking user session...");

      /* ================= 1. GET USER ID ================= */
      const userData = await AsyncStorage.getItem("userId");
      console.log("User ID:", userData);

      if (!userData) {
        throw new Error("User not logged in. Please login again.");
      }

      /* ================= 2. FILE META ================= */
      const fileExt = image.split(".").pop()?.toLowerCase() || "png";
      const fileName = `audit_${Date.now()}.${fileExt}`;
      const contentType = fileExt === "jpg" ? "image/jpeg" : `image/${fileExt}`;

      /* ================= 3. GET S3 URL ================= */
      setLoadingMessage("Preparing upload...");
      const s3Data = await fetchS3ImageUrlApi(fileName, contentType);

      if (!s3Data?.upload_url || !s3Data?.s3_key) {
        throw new Error("Invalid S3 response");
      }

      /* ================= 4. UPLOAD IMAGE ================= */
      setLoadingMessage("Uploading image...");

      const imageResponse = await fetch(image);
      const blob = await imageResponse.blob();

      const uploadRes = await fetch(s3Data.upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: blob,
      });

      if (!uploadRes.ok) {
        throw new Error("Image upload failed");
      }

      /* ================= 5. PROCESS AUDIT ================= */
      setLoadingMessage("Analyzing with AI...");

      const auditPayload = {
        user_id: Number(userData),
        s3_key: s3Data.s3_key,
        target_audience: audience || "General audience",
      };

      const auditResult = await processAuditApi(auditPayload);

      console.log("Audit Response Success:", auditResult);
      
      // RESET STATE
      setIsSubmitting(false);
      setLoadingMessage("");
      setImage(null);
      setAudience("");

      // NAVIGATE TO RESULT SCREEN
      navigation.navigate("AuditResult", { auditData: auditResult });

    } catch (error: any) {
      console.error("Audit Error:", error.message);
      Alert.alert("Audit Failed", error.message);
      setIsSubmitting(false);
      setLoadingMessage("");
    }
  };

  // --- IMAGE PICKER ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery access needed.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation?.openDrawer()}>
          <Menu color="#fff" size={22} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Audit</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.aiBadge}>
          <Sparkles color="#818cf8" size={12} />
          <Text style={styles.aiBadgeText}>AI-Powered Ad Analysis</Text>
        </View>

        <Text style={styles.heroTitle}>
          Optimize Ads with {'\n'}
          <Text style={styles.heroHighlight}>AI Insights</Text>
        </Text>

        <TouchableOpacity 
          style={[styles.uploadContainer, image ? styles.activeBorder : null]} 
          onPress={pickImage}
          disabled={isSubmitting}
        >
          <LinearGradient 
            colors={['rgba(79, 70, 229, 0.08)', 'rgba(15, 23, 42, 0.5)']} 
            style={styles.uploadInner}
          >
            {image ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeIcon} 
                  onPress={() => setImage(null)}
                  disabled={isSubmitting}
                >
                  <X color="#fff" size={16} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <View style={styles.iconCircle}>
                  <Upload color="#818cf8" size={28} />
                </View>
                <Text style={styles.uploadText}>Select Creative</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Target Audience</Text>
          <View style={styles.inputWrapper}>
            <Users color="#64748b" size={18} />
            <TextInput 
              style={styles.input}
              placeholder="e.g. Parents of toddlers"
              placeholderTextColor="#475569"
              value={audience}
              onChangeText={setAudience}
              editable={!isSubmitting}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryBtn, (isSubmitting || !image) && { opacity: 0.6 }]}
            onPress={handleStartAudit}
            disabled={isSubmitting || !image}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Sparkles color="#fff" size={18} />
                <Text style={styles.primaryBtnText}>Start Audit</Text>
              </>
            )}
          </TouchableOpacity>
          
          {isSubmitting && (
            <Text style={styles.statusText}>{loadingMessage}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  topBar: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 20, 
    paddingHorizontal: 20, 
    paddingBottom: 10,
  },
  topBarTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  scrollContent: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(129, 140, 248, 0.08)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20,
  },
  aiBadgeText: { color: '#818cf8', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroHighlight: { color: '#c084fc' },
  uploadContainer: {
    width: '100%', height: 210, marginTop: 30, borderRadius: 24,
    borderWidth: 1.5, borderColor: '#1e293b', borderStyle: 'dashed', overflow: 'hidden',
  },
  activeBorder: { borderColor: '#4f46e5', borderStyle: 'solid' },
  uploadInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  previewContainer: { width: '100%', height: '100%', padding: 10 },
  previewImage: { width: '100%', height: '100%', borderRadius: 15 },
  removeIcon: { 
    position: 'absolute', 
    top: 20, 
    right: 20, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    padding: 8, 
    borderRadius: 20 
  },
  iconCircle: {
    width: 55, height: 55, backgroundColor: 'rgba(129, 140, 248, 0.12)',
    borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15,
  },
  uploadText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  formContainer: { width: '100%', marginTop: 30 },
  label: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 15, height: 52, gap: 12,
  },
  input: { flex: 1, color: '#fff' },
  primaryBtn: {
    backgroundColor: '#4f46e5', height: 52, borderRadius: 12,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 25, gap: 10,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  statusText: { color: '#818cf8', fontSize: 13, textAlign: 'center', marginTop: 15, fontWeight: '500' },
});