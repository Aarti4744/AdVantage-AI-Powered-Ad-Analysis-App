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
  Alert,
  Platform,
} from 'react-native';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldAlert, 
  Target, 
  Calendar, 
  AlertTriangle, 
  Download 
} from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getAuditByIdApi, S3_BASE_URL } from '../../services/api';

export default function AuditDetailScreen({ route, navigation }: any) {
  const { auditId } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchAuditDetails();
  }, [auditId]);

  const fetchAuditDetails = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await getAuditByIdApi(auditId);
      if (response && response.data) {
        setData(response.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Fetch Detail Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ROBUST PARSER
   * Extracts summary, risk, and findings from AI JSON string safely
   */
  const getCleanedAnalysis = (analysisJson: any) => {
    if (!analysisJson) return { summary: '', findings: [], risk: 'Low' };
    
    let result = {
      summary: analysisJson.summary || '',
      risk: analysisJson.risk || 'Low',
      findings: [] as string[]
    };

    try {
      if (typeof analysisJson.summary === 'string' && analysisJson.summary.includes('{')) {
        const cleaned = analysisJson.summary.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        
        result.summary = parsed.summary || result.summary;
        result.risk = parsed.risk || result.risk;
        
        // Check multiple common AI output keys to prevent .map errors
        const rawFindings = parsed.findings || parsed.points || parsed.suggestions || [];
        result.findings = Array.isArray(rawFindings) ? rawFindings : [String(rawFindings)];
      }
    } catch (e) {
      console.log("JSON Parse fallback logic used");
    }
    return result;
  };

  /**
   * GENERATE PDF
   * Creates a professional report and opens the system share/save dialog
   */
  const generatePDF = async () => {
    if (!data) return;
    setIsDownloading(true);

    const info = getCleanedAnalysis(data.analysis_json);
    const scoreColor = data.score >= 80 ? '#10b981' : data.score >= 50 ? '#6366f1' : '#f43f5e';
    const imageUrl = `${S3_BASE_URL}${data.s3_key}`;

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .report-title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
            .score-badge { padding: 20px; background: #f8fafc; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; margin-bottom: 30px; }
            .score-value { font-size: 48px; font-weight: 800; color: ${scoreColor}; margin: 0; }
            .section-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: bold; }
            .img-container { width: 100%; text-align: center; margin: 20px 0; background: #000; border-radius: 12px; overflow: hidden; }
            .main-img { max-height: 400px; max-width: 100%; }
            .analysis-card { background: #fff; padding: 0; }
            .risk-tag { display: inline-block; padding: 4px 12px; border-radius: 20px; background: ${scoreColor}20; color: ${scoreColor}; font-weight: bold; font-size: 12px; margin-bottom: 10px; }
            .findings-list { margin-top: 20px; padding-left: 20px; }
            .finding-item { margin-bottom: 10px; color: #475569; }
            .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; paddingTop: 20px; font-size: 10px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="report-title">Creative Audit Report</h1>
              <p style="color: #64748b; margin: 5px 0 0 0;">Date: ${new Date(data.created_at).toLocaleDateString()}</p>
            </div>
            <div style="text-align: right">
              <p class="section-label">Audience</p>
              <p style="font-weight: bold; margin: 0;">${data.target_audience}</p>
            </div>
          </div>

          <div class="score-badge">
            <p class="section-label" style="margin-bottom: 5px;">Overall Performance Score</p>
            <h2 class="score-value">${data.score}</h2>
          </div>

          <p class="section-label">Analyzed Creative</p>
          <div class="img-container">
            <img src="${imageUrl}" class="main-img" />
          </div>

          <div class="analysis-card">
            <p class="section-label">AI Analysis Insights</p>
            <div class="risk-tag">RISK LEVEL: ${info.risk.toUpperCase()}</div>
            <p style="font-size: 16px; color: #1e293b;">${info.summary}</p>
            
            ${info.findings.length > 0 ? `
              <p class="section-label" style="margin-top: 30px;">Key Findings</p>
              <ul class="findings-list">
                ${info.findings.map(item => `<li class="finding-item">${item}</li>`).join('')}
              </ul>
            ` : ''}
          </div>

          <div class="footer">
            Generated by Wolf AI Audit Engine • Confidence Level: ${data.analysis_json?.confidence || 0}%
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Save Audit Report' });
    } catch (e) {
      Alert.alert("Error", "Failed to generate PDF report.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <AlertTriangle color="#f43f5e" size={48} />
        <Text style={{color: '#fff', marginTop: 10}}>Failed to load audit details</Text>
        <TouchableOpacity onPress={fetchAuditDetails} style={styles.retryBtn}>
           <Text style={{color: '#000', fontWeight: 'bold'}}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const analysis = data.analysis_json || {};
  const processedInfo = getCleanedAnalysis(analysis);
  const scoreColor = data.score >= 80 ? '#10b981' : data.score >= 50 ? '#6366f1' : '#f43f5e';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
          <ArrowLeft color="#fff" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit Result</Text>
        <TouchableOpacity 
          onPress={generatePDF} 
          style={[styles.headerIconBtn, { backgroundColor: '#6366f1' }]}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Download color="#fff" size={20} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.scoreSection}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>{data.score}</Text>
            <Text style={styles.scoreLabel}>Health Score</Text>
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

        <Text style={styles.sectionTitle}>Source Image</Text>
        <Image 
          source={{ uri: `${S3_BASE_URL}${data.s3_key}` }} 
          style={styles.mainImage}
          resizeMode="contain"
        />

        <View style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <ShieldAlert color={scoreColor} size={20} />
            <Text style={styles.analysisTitle}>AI Insights</Text>
          </View>

          <View style={styles.riskRow}>
             <Text style={styles.riskLabel}>Risk Assessment:</Text>
             <Text style={[styles.riskValue, { color: scoreColor }]}>
                {processedInfo.risk.toUpperCase()}
             </Text>
          </View>

          <Text style={styles.summaryText}>
            {processedInfo.summary || "No summary available."}
          </Text>

          {processedInfo.findings.length > 0 && (
             <View style={styles.findingsContainer}>
                <Text style={styles.listTitle}>Key Findings:</Text>
                {processedInfo.findings.map((item, index) => (
                    <View key={index} style={styles.findingItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.findingText}>{item}</Text>
                    </View>
                ))}
             </View>
          )}

          <View style={styles.footerInfo}>
             <View style={styles.confBox}>
                <CheckCircle2 size={16} color="#10b981" />
                <Text style={styles.confText}>AI Confidence: {analysis.confidence || 0}%</Text>
             </View>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  center: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerIconBtn: { padding: 10, backgroundColor: '#1e293b', borderRadius: 12, width: 42, height: 42, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20 },
  retryBtn: { marginTop: 20, backgroundColor: '#22d3ee', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  scoreSection: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 30 },
  scoreCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  scoreText: { fontSize: 30, fontWeight: '900' },
  scoreLabel: { fontSize: 9, color: '#64748b', fontWeight: '700', marginTop: -4 },
  infoCol: { flex: 1, gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0f172a', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' },
  badgeText: { color: '#f1f5f9', fontSize: 13, fontWeight: '500', flexShrink: 1 },
  dateText: { color: '#94a3b8', fontSize: 12 },
  sectionTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' },
  mainImage: { width: '100%', height: 250, borderRadius: 20, backgroundColor: '#0f172a', marginBottom: 30, borderWidth: 1, borderColor: '#1e293b' },
  analysisCard: { backgroundColor: '#0f172a', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1e293b' },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  analysisTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  riskRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  riskLabel: { color: '#94a3b8', fontSize: 14 },
  riskValue: { fontWeight: '800', fontSize: 14 },
  summaryText: { color: '#cbd5e1', fontSize: 15, lineHeight: 24, marginBottom: 20 },
  findingsContainer: { marginBottom: 20 },
  listTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  findingItem: { flexDirection: 'row', marginBottom: 6, paddingRight: 10 },
  bullet: { color: '#6366f1', marginRight: 8, fontSize: 18 },
  findingText: { color: '#94a3b8', fontSize: 13, lineHeight: 20, flex: 1 },
  footerInfo: { borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 15 },
  confBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  confText: { color: '#10b981', fontSize: 13, fontWeight: '700' },
});