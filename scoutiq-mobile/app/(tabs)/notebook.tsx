// Dosya Yolu: app/(tabs)/notebook.tsx

import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator, 
  TouchableOpacity, 
  RefreshControl,
  StatusBar
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../constants'; // constants dosyanın yolunu kontrol et

// 🛡️ TS HATALARINI SÖNDÜREN ARAYÜZ (INTERFACE)
interface NotebookEntry {
  id: string;
  playerId: string;
  createdAt: string;
  player: {
    name: string;
    team: string;
    position: string;
  };
}

export default function NotebookScreen() {
  const router = useRouter();
  
  // 🚀 TİP TANIMLAMASI YAPILDI (Kırmızıyı bu satır söndürür)
  const [notes, setNotes] = useState<NotebookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 📡 VERİLERİ BACKEND'DEN ÇEK
  const fetchNotes = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`${CONFIG.BACKEND_URL}/user-notebook/${userId}`);
      const data = await response.json();
      
      // ✅ VERİ KONTROLÜ VE ATAMA
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notlar yüklenirken hata:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sayfa her odağa alındığında veriyi tazele
  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotes();
  };

  const renderItem = ({ item }: { item: NotebookEntry }) => (
    <TouchableOpacity 
      style={styles.noteCard}
      onPress={() => router.push({ pathname: "/player-details/[id]", params: { id: item.playerId } })}
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="bookmark-outline" size={24} color="#2ecc71" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.playerName}>{item.player?.name || "İsimsiz Yetenek"}</Text>
          <Text style={styles.playerInfo}>{item.player?.team} • {item.player?.position}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString('tr-TR')}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#333" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* BAŞLIK ALANI */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Not Defterim</Text>
          <Text style={styles.headerSub}>Pusuya yattığın yıldız adayları burada.</Text>
        </View>
        <MaterialCommunityIcons name="notebook-multiple" size={32} color="#2ecc71" />
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2ecc71" />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2ecc71" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#222" />
              <Text style={styles.emptyTitle}>Burası Henüz Boş</Text>
              <Text style={styles.emptySub}>
                Haftalık 2 tahmin hakkın bittiğinde eklediğin oyuncular burada listelenir.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 25, 
    backgroundColor: '#1a1a1a', 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },
  headerSub: { color: '#7f8c8d', fontSize: 12, marginTop: 5, fontWeight: '600' },
  listContent: { padding: 20, paddingBottom: 100 },
  noteCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#1a1a1a', 
    padding: 18, 
    borderRadius: 22, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#262626'
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { 
    width: 45, 
    height: 45, 
    borderRadius: 15, 
    backgroundColor: 'rgba(46, 204, 113, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  textContainer: { marginLeft: 15 },
  playerName: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  playerInfo: { color: '#7f8c8d', fontSize: 13, marginTop: 3 },
  cardRight: { alignItems: 'flex-end' },
  dateText: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  emptySub: { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 10, lineHeight: 20 }
});