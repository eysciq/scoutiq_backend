import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Modal, FlatList, TextInput, ActivityIndicator, ScrollView, StatusBar, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 📡 Backend URL
const BACKEND_URL = 'http://192.168.1.181:3001';

export default function CompareScreen() {
  const [loading, setLoading] = useState(false);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [player1, setPlayer1] = useState<any>(null);
  const [player2, setPlayer2] = useState<any>(null);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState<1 | 2>(1);

  // 📡 Oyuncuları Çek
  const fetchAllPlayersForCompare = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const safeEmail = email ? encodeURIComponent(email.toLowerCase().trim()) : '';

      const [myRes, globalRes] = await Promise.all([
        fetch(`${BACKEND_URL}/players?scoutEmail=${safeEmail}`),
        fetch(`${BACKEND_URL}/global-players`)
      ]);

      const myData = myRes.ok ? await myRes.json() : [];
      const globalData = globalRes.ok ? await globalRes.json() : [];

      const combined = [...myData, ...globalData];
      setAllPlayers(combined);
      setFilteredPlayers(combined);
    } catch (error) {
      console.log("❌ Karşılaştırma Verisi Hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPlayersForCompare();
  }, []);

  // 🔍 Arama Filtresi
  useEffect(() => {
    const lowerQ = searchQuery.toLowerCase().trim();
    if (lowerQ === '') {
      setFilteredPlayers(allPlayers);
    } else {
      setFilteredPlayers(allPlayers.filter(p => p.name.toLowerCase().includes(lowerQ)));
    }
  }, [searchQuery, allPlayers]);

  const openSelectionModal = (slot: 1 | 2) => {
    setSelectingFor(slot);
    setSearchQuery('');
    setModalVisible(true);
  };

  const selectPlayer = (player: any) => {
    if (selectingFor === 1) setPlayer1(player);
    else setPlayer2(player);
    setModalVisible(false);
  };

  // 📊 Kıyaslama Çubukları
  const renderComparisonBar = (label: string, val1: any, val2: any, isGlobal1: boolean, isGlobal2: boolean, isLowerBetter = false) => {
    // Özel Durum: Global oyuncu reytingi
    if (label === "POTANSİYEL (OVR)" && (isGlobal1 || isGlobal2)) {
      return (
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{label}</Text>
          <View style={styles.textStatRow}>
             <View style={styles.textStatSide}>
               <Text style={[styles.textStatValue, {color: isGlobal1 ? '#7f8c8d' : '#2ecc71'}]}>
                 {isGlobal1 ? 'Keşif Gerekli' : val1}
               </Text>
             </View>
             <Text style={styles.textStatLabel}>OVR</Text>
             <View style={styles.textStatSide}>
               <Text style={[styles.textStatValue, {color: isGlobal2 ? '#7f8c8d' : '#2ecc71'}]}>
                 {isGlobal2 ? 'Keşif Gerekli' : val2}
               </Text>
             </View>
          </View>
        </View>
      );
    }

    const num1 = parseFloat(val1) || 0;
    const num2 = parseFloat(val2) || 0;
    
    let p1Color = '#95a5a6';
    let p2Color = '#95a5a6';

    if (num1 !== num2 && num1 !== 0 && num2 !== 0) {
      const condition = isLowerBetter ? num1 < num2 : num1 > num2;
      p1Color = condition ? '#2ecc71' : '#e74c3c';
      p2Color = condition ? '#e74c3c' : '#2ecc71';
    }

    const max = Math.max(num1, num2, 1); 
    const p1Width = (num1 / max) * 100;
    const p2Width = (num2 / max) * 100;

    return (
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.barContainer}>
          <View style={styles.barSideLeft}>
            <Text style={[styles.barValueText, { color: p1Color, marginRight: 8 }]}>{val1 || '-'}</Text>
            <View style={[styles.barFill, { width: `${p1Width}%`, backgroundColor: p1Color }]} />
          </View>
          <View style={styles.barDivider} />
          <View style={styles.barSideRight}>
            <View style={[styles.barFill, { width: `${p2Width}%`, backgroundColor: p2Color }]} />
            <Text style={[styles.barValueText, { color: p2Color, marginLeft: 8 }]}>{val2 || '-'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <MaterialCommunityIcons name="scale-balance" size={32} color="#3498db" />
        <Text style={styles.headerTitle}>Çarpışma Testi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.selectionArena}>
          <TouchableOpacity style={styles.playerSelectCard} onPress={() => openSelectionModal(1)}>
            {player1 ? (
              <>
                <MaterialCommunityIcons name={player1.isGlobal ? "earth" : "account-check"} size={40} color={player1.isGlobal ? "#2980b9" : "#3498db"} />
                <Text style={styles.selectedName} numberOfLines={1}>{player1.name}</Text>
                <Text style={styles.selectedTeam} numberOfLines={1}>{player1.team || 'Serbest'}</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="plus-circle-outline" size={40} color="#555" />
                <Text style={styles.addText}>Oyuncu 1 Seç</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View>

          <TouchableOpacity style={styles.playerSelectCard} onPress={() => openSelectionModal(2)}>
            {player2 ? (
              <>
                <MaterialCommunityIcons name={player2.isGlobal ? "earth" : "account-check"} size={40} color={player2.isGlobal ? "#2980b9" : "#e74c3c"} />
                <Text style={styles.selectedName} numberOfLines={1}>{player2.name}</Text>
                <Text style={styles.selectedTeam} numberOfLines={1}>{player2.team || 'Serbest'}</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="plus-circle-outline" size={40} color="#555" />
                <Text style={styles.addText}>Oyuncu 2 Seç</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {player1 && player2 ? (
          <View style={styles.matrixCard}>
            <Text style={styles.matrixTitle}>Kıyaslama Matrisi</Text>
            {renderComparisonBar("POTANSİYEL (OVR)", player1.rating, player2.rating, player1.isGlobal, player2.isGlobal)}
            {renderComparisonBar("YAŞ", player1.age, player2.age, false, false, true)} 
            
            <View style={styles.textStatRow}>
               <View style={styles.textStatSide}><Text style={styles.textStatValue}>{player1.position}</Text></View>
               <Text style={styles.textStatLabel}>MEVKİ</Text>
               <View style={styles.textStatSide}><Text style={styles.textStatValue}>{player2.position}</Text></View>
            </View>

            <View style={styles.textStatRow}>
               <View style={styles.textStatSide}><Text style={styles.textStatValue}>{player1.foot || 'Sağ'}</Text></View>
               <Text style={styles.textStatLabel}>AYAK</Text>
               <View style={styles.textStatSide}><Text style={styles.textStatValue}>{player2.foot || 'Sağ'}</Text></View>
            </View>

            <View style={styles.textStatRow}>
               <View style={styles.textStatSide}><Text style={styles.textStatValue}>{player1.height ? player1.height + ' cm' : '-'}</Text></View>
               <Text style={styles.textStatLabel}>BOY</Text>
               <View style={styles.textStatSide}><Text style={styles.textStatValue}>{player2.height ? player2.height + ' cm' : '-'}</Text></View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="sword-cross" size={60} color="#333" />
            <Text style={styles.emptyStateText}>Analiz için her iki köşeye de birer aday yerleştirmelisin.</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Aday Seçimi</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close-circle" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <TextInput 
              style={styles.searchInput} 
              placeholder="İsimle ara..." 
              placeholderTextColor="#7f8c8d"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {loading ? <ActivityIndicator size="large" color="#3498db" /> : (
              <FlatList
                data={filteredPlayers}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalItem} onPress={() => selectPlayer(item)}>
                    <View>
                      <Text style={styles.modalItemName}>{item.name}</Text>
                      <Text style={styles.modalItemSub}>{item.position} • {item.team || 'Serbest'}</Text>
                    </View>
                    <View style={[styles.modalItemBadge, { backgroundColor: item.isGlobal ? '#2980b9' : '#34495e' }]}>
                      {item.isGlobal ? <MaterialCommunityIcons name="earth" size={20} color="#fff" /> : <Text style={styles.modalItemRating}>{item.rating}</Text>}
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 40, backgroundColor: '#1e1e1e', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  content: { padding: 20 },
  selectionArena: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  playerSelectCard: { flex: 1, backgroundColor: '#1e1e1e', height: 130, borderRadius: 20, borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center', padding: 10 },
  addText: { color: '#555', fontSize: 12, marginTop: 8, fontWeight: 'bold' },
  selectedName: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
  selectedTeam: { color: '#7f8c8d', fontSize: 10, marginTop: 2, textAlign: 'center' },
  vsCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1c40f', justifyContent: 'center', alignItems: 'center', marginHorizontal: -18, zIndex: 10, borderWidth: 3, borderColor: '#121212' },
  vsText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  matrixCard: { backgroundColor: '#1e1e1e', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333' },
  matrixTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  statRow: { marginBottom: 18 },
  statLabel: { color: '#555', fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  barContainer: { flexDirection: 'row', alignItems: 'center', height: 20 },
  barSideLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  barSideRight: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  barDivider: { width: 1, height: '100%', backgroundColor: '#333', marginHorizontal: 10 },
  barFill: { height: 6, borderRadius: 3 },
  barValueText: { fontSize: 12, fontWeight: 'bold' },
  textStatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#2c2c2c' },
  textStatSide: { flex: 1, alignItems: 'center' },
  textStatValue: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  textStatLabel: { color: '#555', fontSize: 9, width: 60, textAlign: 'center', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyStateText: { color: '#444', marginTop: 15, fontSize: 13, textAlign: 'center', paddingHorizontal: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1e1e1e', height: '85%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  searchInput: { backgroundColor: '#2c2c2c', color: '#fff', borderRadius: 12, padding: 15, marginBottom: 15 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c2c2c', padding: 15, borderRadius: 15, marginBottom: 10 },
  modalItemName: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  modalItemSub: { color: '#7f8c8d', fontSize: 11, marginTop: 2 },
  modalItemBadge: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  modalItemRating: { color: '#fff', fontWeight: 'bold', fontSize: 13 }
});