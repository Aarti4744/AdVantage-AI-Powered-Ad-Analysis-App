import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ShieldCheck, AlertTriangle, Target, Gauge } from 'lucide-react-native';

export default function AuditResultScreen({ route, navigation }: any) {
  const { auditData } = route.params;

  // Helper to parse the AI summary string which contains Markdown JSON
  const parseAiSummary = (rawSummary: string) => {
    try {
      // Remove Markdown code blocks (```json ... ```)
      const cleanJson = rawSummary.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      return {
        risk: "Unknown",
        summary: rawSummary,
        confidence: 0
      };
    }
  };

  const aiDetails = parseAiSummary(auditData.summary);
  const score = auditData.score;

  // Color logic based on risk
  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#818cf8';
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Audit Results</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Score Circle */}
          <View style={styles.scoreCard}>
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={styles.scoreGradient}
            >
              <Gauge color={getRiskColor(aiDetails.risk)} size={32} style={{ marginBottom: 10 }} />
              <Text style={styles.scoreLabel}>Compliance Score</Text>
              <Text style={[styles.scoreValue, { color: getRiskColor(aiDetails.risk) }]}>{score}%</Text>
            </LinearGradient>
          </View>

          {/* Risk Badge */}
          <View style={styles.detailsContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Risk Level</Text>
                <View style={[styles.badge, { backgroundColor: `${getRiskColor(aiDetails.risk)}20` }]}>
                  <Text style={[styles.badgeText, { color: getRiskColor(aiDetails.risk) }]}>
                    {aiDetails.risk.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Confidence</Text>
                <Text style={styles.infoValue}>{aiDetails.confidence}%</Text>
              </View>
            </View>

            {/* AI Summary Section */}
            <View style={styles.summarySection}>
              <View style={styles.sectionTitleRow}>
                <ShieldCheck color="#818cf8" size={20} />
                <Text style={styles.sectionTitle}>AI Analysis</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>{aiDetails.summary}</Text>
              </View>
            </View>

            {/* Target Audience Reminder */}
            <View style={styles.metaInfo}>
              <Target color="#64748b" size={16} />
              <Text style={styles.metaText}>Audit ID: #{auditData.audit_id}</Text>
            </View>
          </View>

     
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20, alignItems: 'center' },
  scoreCard: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  scoreGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  scoreValue: { fontSize: 48, fontWeight: '800', marginTop: 5 },
  detailsContainer: { width: '100%' },
  infoRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  infoBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  infoLabel: { color: '#64748b', fontSize: 12, marginBottom: 8, fontWeight: '600' },
  infoValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 12, fontWeight: '800' },
  summarySection: { width: '100%', marginBottom: 25 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  summaryCard: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  summaryText: { color: '#cbd5e1', fontSize: 15, lineHeight: 24 },
  metaInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  metaText: { color: '#475569', fontSize: 12 },
  doneBtn: {
    backgroundColor: '#4f46e5',
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});