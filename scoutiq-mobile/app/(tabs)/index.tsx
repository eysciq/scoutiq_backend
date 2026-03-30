import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ YENİ PAKET BURADA
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🚀 Merkezi Yapılandırma ve Tema
import { CONFIG, TEAM_COLORS } from '../../constants';

export default function MyPortfolioScreen() {
  const [myPlayers, setMyPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('Scout');
  const router = useRouter();

  // 📡 Verileri Çek
  const fetchMyPlayers = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (!email) {
        setLoading(false);
        return;
      }

      const cleanEmail = email.toLowerCase().trim();
      setUserName(cleanEmail.split('@')[0].toUpperCase());

      const safeEmail = encodeURIComponent(cleanEmail);
      const response = await fetch(`${CONFIG.BACKEND_URL}/players?scoutEmail=${safeEmail}`);
      
      if (response.ok) {
        const data = await response.json();
        setMyPlayers(data);
        setFilteredPlayers(data);
      }
    } catch (error) {
      console.log("❌ Portföy Çekme Hatası:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyPlayers();
      setSearchQuery('');
    }, [])
  );

  // 🗑️ Silme İşlemi (Güvenli Kontrol)
  const handleDelete = (id: number, name: string) => {
    Alert.alert("Emin misin?", `${name} isimli yeteneği arşivden kaldırıyorsun.`, [
      { text: "Vazgeç", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => {
          try {
            const res = await fetch(`${CONFIG.BACKEND_URL}/delete-player/${id}`, { method: 'DELETE' });
            if (res.ok) fetchMyPlayers();
          } catch (e) {
            Alert.alert("Hata", "Silme işlemi yapılamadı. Bağlantını kontrol et.");
          }
      }}
    ]);
  };

  // 🔍 Dinamik Arama Motoru
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const filtered = myPlayers.filter(p => 
        (p.name && p.name.toLowerCase().includes(query)) || 
        (p.team && p.team.toLowerCase().includes(query))
      );
      setFilteredPlayers(filtered);
    } else {
      setFilteredPlayers(myPlayers);
    }
  }, [searchQuery, myPlayers]);

  const renderPlayer = ({ item }: { item: any }) => {
    const teamKey = item.team ? item.team.toLowerCase().trim() : '';
    // Güvenli takım rengi ataması
    const colors = TEAM_COLORS[teamKey] || { primary: '#2c3e50', secondary: '#34495e', text: '#95a5a6' };
    
    // Rating'in boş veya null gelme ihtimaline karşı güvenli parse
    const ratingNum = parseInt(item.rating) || 0;
    const isHighPotential = ratingNum >= 80;

    return (
      <TouchableOpacity 
        style={styles.playerCard}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: "/player-details", params: { id: item.id } })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.ratingBadge, { backgroundColor: isHighPotential ? '#f1c40f' : '#2ecc71' }]}>
            <Text style={styles.ratingText}>{item.rating || '-'}</Text>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.playerName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.positionText} numberOfLines={1}>{item.position} • {item.team || 'Serbest'}</Text>
          </View>

          <View style={[styles.teamBadge, { backgroundColor: colors.primary, borderColor: colors.secondary, borderWidth: 1 }]}>
            <Text style={[styles.teamBadgeText, { color: colors.text }]}>
              {item.team ? item.team.substring(0, 3).toUpperCase() : 'FA'}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
             <Text style={{color: '#2ecc71', fontSize: 11, fontWeight: 'bold', marginRight: 5}}>Raporu İncele</Text>
             <MaterialCommunityIcons name="chevron-right" size={16} color="#2ecc71" />
          </View>

          <View style={styles.btnGroup}>
            <TouchableOpacity 
              style={styles.smallActionBtn} 
              onPress={() => router.push({ pathname: "/edit-player", params: { id: item.id } })}
            >
              <MaterialCommunityIcons name="pencil-outline" size={16} color="#f1c40f" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.smallActionBtn, {marginLeft: 10}]} 
              onPress={() => handleDelete(item.id, item.name)}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={16} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e1e1e" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetingText}>Merhaba, {userName} 👋</Text>
            <Text style={styles.headerTitle}>Portföyün</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{myPlayers.length}</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#95a5a6" />
          <TextInput 
            style={styles.searchInput}
            placeholder="İsim veya Takım Ara..."
            placeholderTextColor="#7f8c8d"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2ecc71" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPlayer}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMyPlayers} tintColor="#2ecc71" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="folder-open-outline" size={80} color="#333" />
              <Text style={styles.emptyTitle}>Henüz Raporun Yok</Text>
              <Text style={styles.emptyText}>Yeni bir yetenek ekleyerek scout puanı kazanmaya başla!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { 
    padding: 20, 
    paddingTop: Platform.OS === 'ios' ? 10 : 40, 
    backgroundColor: '#1e1e1e', 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 10 // Gölgenin listenin üstüne düşmesi için
  },
  greetingText: { color: '#2ecc71', fontSize: 13, fontWeight: 'bold', marginBottom: 5 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  countBadge: { backgroundColor: '#2ecc71', width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  countText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c2c2c', borderRadius: 12, paddingHorizontal: 12, height: 45, marginTop: 15 },
  searchInput: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 14 },
  listContainer: { padding: 15, paddingBottom: 100 },
  playerCard: { 
    backgroundColor: '#1e1e1e', 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#333',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  ratingBadge: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  ratingText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  infoContainer: { flex: 1, paddingRight: 10 },
  playerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  positionText: { color: '#7f8c8d', fontSize: 12, marginTop: 3 },
  teamBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, minWidth: 45, alignItems: 'center' },
  teamBadgeText: { fontSize: 11, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2c2c2c' },
  btnGroup: { flexDirection: 'row' },
  smallActionBtn: { padding: 8, backgroundColor: '#2c2c2c', borderRadius: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  emptyText: { color: '#7f8c8d', textAlign: 'center', marginTop: 10, paddingHorizontal: 30, lineHeight: 20 }
});