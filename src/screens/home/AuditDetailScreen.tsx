import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { ArrowLeft, AlertCircle, CheckCircle2, ShieldAlert, Target, Calendar } from 'lucide-react-native';
import { getAuditByIdApi, S3_BASE_URL } from '../../services/api';

const { width } = Dimensions.get('window');

export default function AuditDetailScreen({ route, navigation }: any) {
  const { auditId } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditDetails();
  }, [auditId]);

  const fetchAuditDetails = async () => {
    try {
      setLoading(true);
      const response = await getAuditByIdApi(auditId);
      setData(response.data);
    } catch (error) {
      console.error("Fetch Detail Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse the inner "json" summary string found in your screenshot
  const parseInnerSummary = (summaryStr: string) => {
    try {
      // Remove the ```json ... ``` wrapper if it exists
      const cleaned = summaryStr.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      return { summary: summaryStr };
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  const analysis = data?.analysis_json;
  const innerDetails = analysis?.summary ? parseInnerSummary(analysis.summary) : {};
  const scoreColor = data.score >= 80 ? '#10b981' : data.score >= 50 ? '#6366f1' : '#f43f5e';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit Result</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Visual Header / Score */}
        <View style={styles.scoreSection}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>{data.score}</Text>
            <Text style={styles.scoreLabel}>Overall Score</Text>
          </View>
          <View style={styles.infoCol}>
             <View style={styles.badge}>
                <Target size={14} color="#818cf8" />
                <Text style={styles.badgeText} numberOfLines={2}>{data.target_audience}</Text>
             </View>
             <View style={styles.badge}>
                <Calendar size={14} color="#94a3b8" />
                <Text style={styles.dateText}>{new Date(data.created_at).toLocaleDateString()}</Text>
             </View>
          </View>
        </View>

        {/* Audit Image Preview */}
        <Text style={styles.sectionTitle}>Source Image</Text>
        <Image 
          source={{ uri: `${S3_BASE_URL}${data.s3_key}` }} 
          style={styles.mainImage}
          resizeMode="contain"
        />

        {/* Analysis Findings */}
        <View style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <ShieldAlert color={scoreColor} size={20} />
            <Text style={styles.analysisTitle}>AI Critical Analysis</Text>
          </View>

          <View style={styles.riskRow}>
             <Text style={styles.riskLabel}>Detected Risk:</Text>
             <Text style={[styles.riskValue, { color: scoreColor }]}>
                {(innerDetails.risk || analysis.risk || 'Low').toUpperCase()}
             </Text>
          </View>

          <Text style={styles.summaryText}>
            {innerDetails.summary || analysis.summary}
          </Text>

          <View style={styles.footerInfo}>
             <View style={styles.confBox}>
                <CheckCircle2 size={16} color="#10b981" />
                <Text style={styles.confText}>AI Confidence: {analysis.confidence}%</Text>
             </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  center: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 8, backgroundColor: '#1e293b', borderRadius: 12 },
  scrollContent: { padding: 20 },
  
  scoreSection: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 30 },
  scoreCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  scoreText: { fontSize: 32, fontWeight: '900' },
  scoreLabel: { fontSize: 10, color: '#64748b', fontWeight: '700', marginTop: -4 },
  
  infoCol: { flex: 1, gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0f172a', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' },
  badgeText: { color: '#f1f5f9', fontSize: 13, fontWeight: '500', flexShrink: 1 },
  dateText: { color: '#94a3b8', fontSize: 12 },

  sectionTitle: { color: '#94a3b8', fontSize: 14, fontWeight: '700', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' },
  mainImage: { width: '100%', height: 250, borderRadius: 20, backgroundColor: '#0f172a', marginBottom: 30, borderWidth: 1, borderColor: '#1e293b' },

  analysisCard: { backgroundColor: '#0f172a', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1e293b' },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  analysisTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  riskRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  riskLabel: { color: '#94a3b8', fontSize: 14 },
  riskValue: { fontWeight: '800', fontSize: 14 },
  summaryText: { color: '#cbd5e1', fontSize: 15, lineHeight: 24, marginBottom: 20 },
  footerInfo: { borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 15 },
  confBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  confText: { color: '#10b981', fontSize: 13, fontWeight: '700' },
});