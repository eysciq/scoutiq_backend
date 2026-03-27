import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Modal, FlatList, TextInput, ActivityIndicator, ScrollView, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'http://192.168.1.181:3001';

export default function CompareScreen() {
  const [loading, setLoading] = useState(false);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Seçilen Oyuncular
  const [player1, setPlayer1] = useState<any>(null);
  const [player2, setPlayer2] = useState<any>(null);
  
  // Modal Kontrolü
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState<1 | 2>(1);

  // 📡 Tüm Oyuncuları (Senin Raporların + Dünya Yıldızları) Çek
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
      console.log("❌ Karşılaştırma Verisi Çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPlayersForCompare();
  }, []);

  // 🔍 Arama Motoru (Modal İçi)
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlayers(allPlayers);
    } else {
      const lowerQ = searchQuery.toLowerCase().trim();
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

  // 📊 Çubuk Grafik Hesaplayıcı (Kim Daha İyi?)
  const renderComparisonBar = (label: string, val1: any, val2: any, isGlobal1: boolean, isGlobal2: boolean, isLowerBetter = false) => {
    // 🔥 Eğer her ikisi de (veya biri) Global oyuncuysa (reytingi yoksa) ve biz "POTANSİYEL" arıyorsak, çubuk çizme!
    if (label === "POTANSİYEL (OVR)" && (isGlobal1 || isGlobal2)) {
      return (
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{label}</Text>
          <View style={styles.textStatRow}>
             <View style={styles.textStatSide}>
               <Text style={[styles.textStatValue, {color: isGlobal1 ? '#7f8c8d' : '#fff'}]}>
                 {isGlobal1 ? 'Keşif Bekleniyor' : val1}
               </Text>
             </View>
             <Text style={styles.textStatLabel}>OVR</Text>
             <View style={styles.textStatSide}>
               <Text style={[styles.textStatValue, {color: isGlobal2 ? '#7f8c8d' : '#fff'}]}>
                 {isGlobal2 ? 'Keşif Bekleniyor' : val2}
               </Text>
             </View>
          </View>
        </View>
      );
    }

    const num1 = Number(val1) || 0;
    const num2 = Number(val2) || 0;
    
    let p1Color = '#95a5a6';
    let p2Color = '#95a5a6';

    if (num1 !== num2) {
      if (isLowerBetter) {
        p1Color = num1 < num2 ? '#2ecc71' : '#e74c3c';
        p2Color = num2 < num1 ? '#2ecc71' : '#e74c3c';
      } else {
        p1Color = num1 > num2 ? '#2ecc71' : '#e74c3c';
        p2Color = num2 > num1 ? '#2ecc71' : '#e74c3c';
      }
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
            <View style={[styles.barFill, { width: `${p1Width}%`, backgroundColor: p1Color, alignSelf: 'flex-end' }]} />
          </View>
          <View style={styles.barDivider} />
          <View style={styles.barSideRight}>
            <View style={[styles.barFill, { width: `${p2Width}%`, backgroundColor: p2Color, alignSelf: 'flex-start' }]} />
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
        {/* 🥊 SEÇİM KARTLARI */}
        <View style={styles.selectionArena}>
          {/* SOL KÖŞE: PLAYER 1 */}
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

          <View style={styles.vsCircle}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* SAĞ KÖŞE: PLAYER 2 */}
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

        {/* 📊 KARŞILAŞTIRMA MATRİSİ */}
        {player1 && player2 ? (
          <View style={styles.matrixCard}>
            <Text style={styles.matrixTitle}>Fiziksel & Teknik Kapışma</Text>
            
            {/* Sayısal Değerler (Grafikli) */}
            {renderComparisonBar("POTANSİYEL (OVR)", player1.rating, player2.rating, player1.isGlobal, player2.isGlobal)}
            {renderComparisonBar("YAŞ", player1.age, player2.age, false, false, true)} 
            
            {/* Metin ve Fiziksel Özellikler */}
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

            <View style={styles.textStatRow}>
               <View style={styles.textStatSide}><Text style={styles.textStatValue}>{player1.weight ? player1.weight + ' kg' : '-'}</Text></View>
               <Text style={styles.textStatLabel}>KİLO</Text>
               <View style={styles.textStatSide}><Text style={styles.textStatValue}>{player2.weight ? player2.weight + ' kg' : '-'}</Text></View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="sword-cross" size={60} color="#333" />
            <Text style={styles.emptyStateText}>Analiz için her iki köşeye de oyuncu seçmelisin.</Text>
          </View>
        )}
      </ScrollView>

      {/* 📜 OYUNCU SEÇİM MODALI */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adayı Seç</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close-circle" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput 
              style={styles.searchInput} 
              placeholder="Oyuncu ara..." 
              placeholderTextColor="#7f8c8d"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {loading ? <ActivityIndicator size="large" color="#3498db" style={{marginTop: 50}} /> : (
              <FlatList
                data={filteredPlayers}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalItem} onPress={() => selectPlayer(item)}>
                    <View>
                      <Text style={styles.modalItemName}>{item.name}</Text>
                      <Text style={styles.modalItemSub}>{item.position} • {item.team || 'Serbest'}</Text>
                    </View>
                    
                    {/* 🔥 MODAL İÇİNDE DÜNYA İKONU DESTEĞİ 🔥 */}
                    <View style={[styles.modalItemBadge, { backgroundColor: item.isGlobal ? '#2980b9' : '#34495e' }]}>
                      {item.isGlobal ? (
                         <MaterialCommunityIcons name="earth" size={20} color="#fff" />
                      ) : (
                         <Text style={styles.modalItemRating}>{item.rating}</Text>
                      )}
                    </View>

                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={{color: '#7f8c8d', textAlign: 'center', marginTop: 20}}>Oyuncu bulunamadı.</Text>}
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
  header: { padding: 20, paddingTop: 40, backgroundColor: '#1e1e1e', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  content: { padding: 20, paddingBottom: 100 },
  selectionArena: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  playerSelectCard: { flex: 1, backgroundColor: '#1e1e1e', height: 140, borderRadius: 20, borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center', padding: 10 },
  addText: { color: '#7f8c8d', fontSize: 13, marginTop: 10, fontWeight: 'bold' },
  selectedName: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  selectedTeam: { color: '#bdc3c7', fontSize: 11, marginTop: 4, textAlign: 'center' },
  vsCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1c40f', justifyContent: 'center', alignItems: 'center', marginHorizontal: -20, zIndex: 10, borderWidth: 3, borderColor: '#121212' },
  vsText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  
  matrixCard: { backgroundColor: '#1e1e1e', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333' },
  matrixTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  statRow: { marginBottom: 20 },
  statLabel: { color: '#95a5a6', fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, letterSpacing: 1 },
  barContainer: { flexDirection: 'row', alignItems: 'center', height: 24 },
  barSideLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  barSideRight: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  barDivider: { width: 2, height: '100%', backgroundColor: '#333', marginHorizontal: 10 },
  barFill: { height: 8, borderRadius: 4 },
  barValueText: { fontSize: 14, fontWeight: 'bold' },
  
  textStatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#2c2c2c' },
  textStatSide: { flex: 1, alignItems: 'center' },
  textStatValue: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  textStatLabel: { color: '#7f8c8d', fontSize: 10, width: 60, textAlign: 'center', fontWeight: 'bold' },

  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyStateText: { color: '#555', marginTop: 15, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1e1e1e', height: '80%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  searchInput: { backgroundColor: '#2c2c2c', color: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, fontSize: 15 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c2c2c', padding: 15, borderRadius: 15, marginBottom: 10 },
  modalItemName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalItemSub: { color: '#95a5a6', fontSize: 12, marginTop: 4 },
  modalItemBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  modalItemRating: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});