import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Search,
  SlidersHorizontal,
  Eye, // Kept Eye
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuditHistoryApi } from '../../services/api';

const { width } = Dimensions.get('window');

export default function HistoryScreen({ navigation }: any) {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = useCallback(async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        Alert.alert("Session Expired", "Please log in again.");
        return;
      }

      const response = await getAuditHistoryApi({
        user_id: userId,
        page: pageNum,
        limit: 5,
      });

      setAudits(response.data.items);
      setTotal(response.data.total);
      setPage(response.data.page);
    } catch (error) {
      console.error("History API Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#6366f1';
    return '#f43f5e';
  };

  const renderAuditCard = (item: any) => {
    const scoreColor = getScoreColor(item.score);
    const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    
    const fileName = item.s3_key.split('/').pop() || 'Creative Analysis';

    const handleViewDetails = () => {
        navigation.navigate('AuditDetail', { auditId: item.id });
    };

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.88}
        style={styles.card}
        onPress={handleViewDetails} 
      >
        <View style={styles.cardHeader}>
          <View style={[styles.previewBox, { backgroundColor: scoreColor + '15' }]}>
            <View style={[styles.innerPreview, { backgroundColor: scoreColor }]} />
          </View>

          <View style={styles.nameSection}>
            <Text style={styles.auditTitle} numberOfLines={1}>{fileName}</Text>
            <Text style={styles.audienceText} numberOfLines={1}>
              Target: {item.target_audience}
            </Text>
          </View>

          <View style={[styles.scoreContainer, { borderColor: scoreColor + '40', backgroundColor: scoreColor + '10' }]}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>{item.score}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateLabel}>{dateStr}</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
                style={styles.actionIcon} 
                onPress={handleViewDetails} 
            >
              <Eye color="#94a3b8" size={18} strokeWidth={2.5} />
            </TouchableOpacity>
            {/* Download and Delete buttons removed from here */}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color="#f8fafc" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit History</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{total} Total</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22d3ee" />
        }
      >
        <Text style={styles.screenSubtitle}>Manage and review your creative audits</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Search color="#64748b" size={20} />
            <TextInput
              placeholder="Search history..."
              placeholderTextColor="#64748b"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#22d3ee" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.cardsList}>
            {audits.length > 0 ? (
              audits.map(renderAuditCard)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No audits found.</Text>
              </View>
            )}
          </View>
        )}

        {total > 0 && !loading && (
          <View style={styles.pagination}>
            <Text style={styles.paginationText}>Page {page} of {Math.ceil(total / 5)}</Text>
            <View style={styles.pageControls}>
              <TouchableOpacity 
                style={[styles.pageArrow, page === 1 && { opacity: 0.3 }]} 
                disabled={page === 1}
                onPress={() => fetchHistory(page - 1)}
              >
                <ChevronLeft color="#94a3b8" size={22} />
              </TouchableOpacity>
              <View style={styles.currentPageDot}>
                <Text style={styles.currentPageText}>{page}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.pageArrow, audits.length < 5 && { opacity: 0.3 }]} 
                disabled={audits.length < 5}
                onPress={() => fetchHistory(page + 1)}
              >
                <ChevronRight color="#94a3b8" size={22} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 55, paddingBottom: 16 },
  headerTitle: { color: '#f8fafc', fontSize: 20, fontWeight: '800' },
  countPill: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  countText: { color: '#22d3ee', fontSize: 13, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  screenSubtitle: { color: '#64748b', fontSize: 15, marginBottom: 24 },
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 14, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#1e293b' },
  searchInput: { flex: 1, color: '#f1f5f9', fontSize: 15, marginLeft: 12 },
  filterBtn: { backgroundColor: '#0f172a', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#1e293b' },
  cardsList: { gap: 16 },
  card: { backgroundColor: '#0f172a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1e293b' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  previewBox: { width: 52, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  innerPreview: { width: 24, height: 24, borderRadius: 6 },
  nameSection: { flex: 1 },
  auditTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
  audienceText: { color: '#64748b', fontSize: 13, marginTop: 2 },
  scoreContainer: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, minWidth: 50, alignItems: 'center' },
  scoreValue: { fontSize: 15, fontWeight: '800' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1e293b' },
  dateLabel: { color: '#64748b', fontSize: 13 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionIcon: { padding: 8, borderRadius: 10, backgroundColor: '#1e293b50' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#475569', fontSize: 16 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 },
  paginationText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  pageControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pageArrow: { padding: 8, borderRadius: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b' },
  currentPageDot: { backgroundColor: '#22d3ee20', borderRadius: 12, width: 38, height: 38, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#22d3ee50' },
  currentPageText: { color: '#22d3ee', fontWeight: '800', fontSize: 15 },
});