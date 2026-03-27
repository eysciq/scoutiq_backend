import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator, TouchableOpacity, ScrollView, StatusBar, Image, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

const teamColors: any = {
  'galatasaray': { primary: '#A90432', secondary: '#FDB912', text: '#fff' },
  'fenerbahçe': { primary: '#002347', secondary: '#FEDD00', text: '#fff' },
  'beşiktaş': { primary: '#000000', secondary: '#FFFFFF', text: '#fff' },
  'trabzonspor': { primary: '#800020', secondary: '#2196F3', text: '#fff' },
  'erzurumspor': { primary: '#005696', secondary: '#FFFFFF', text: '#fff' },
  'başakşehir': { primary: '#004A99', secondary: '#ED7102', text: '#fff' },
  'kasımpaşa': { primary: '#005CAB', secondary: '#FFFFFF', text: '#fff' },
  'eyüpspor': { primary: '#601F7F', secondary: '#F1C40F', text: '#fff' },
  'samsunspor': { primary: '#E30613', secondary: '#FFFFFF', text: '#fff' },
  'göztepe': { primary: '#FDB912', secondary: '#E30613', text: '#000' },
  'real madrid': { primary: '#FFFFFF', secondary: '#FEBE10', text: '#000' },
  'barcelona': { primary: '#004D98', secondary: '#A50044', text: '#fff' },
  'manchester city': { primary: '#6CABDD', secondary: '#FFFFFF', text: '#000' },
  'arsenal': { primary: '#EF0107', secondary: '#FFFFFF', text: '#fff' },
};

export default function PlayerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playerImage, setPlayerImage] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const BACKEND_URL = 'http://192.168.1.181:3001';

  const fetchPlayerDetails = async () => {
    try {
      setLoading(true);
      const email = await AsyncStorage.getItem('userEmail');
      setCurrentUserEmail(email ? email.toLowerCase().trim() : null);

      const response = await fetch(`${BACKEND_URL}/player-details/${id}`);
      const data = await response.json();
      setPlayer(data);
      
      const storedImage = await AsyncStorage.getItem(`player_image_${id}`);
      if (storedImage) setPlayerImage(storedImage);
    } catch (error) {
      console.log("❌ Detay Hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPlayerDetails(); }, [id]));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      setPlayerImage(newUri);
      await AsyncStorage.setItem(`player_image_${id}`, newUri);
    }
  };

  // Piyasa Değeri Formülü: $$V = \left(\frac{R^4}{600,000}\right) \times F$$
  const calculateMarketValue = (age: any, rating: any) => {
    const a = Number(age) || 22;
    const r = Number(rating) || 70;
    const factor = a < 23 ? 1.5 : a < 30 ? 1.0 : 0.5;
    let val = (Math.pow(r, 4) / 600000) * factor;
    return val < 1 ? (val * 1000).toFixed(0) + " Bin €" : val.toFixed(1) + " Milyon €";
  };

  const deletePlayer = () => {
    Alert.alert("Dikkat", "Bu raporu kalıcı olarak silmek istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => {
        const res = await fetch(`${BACKEND_URL}/delete-player/${id}`, { method: 'DELETE' });
        if (res.ok) router.replace('/(tabs)');
      }}
    ]);
  };

  if (loading || !player) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#2ecc71" /></View>
  );

  // 🔥 ÇELİK YELEK GİBİ KONTROL: Eğer bu rapor senin mailine ait değilse GLOBAL'dir.
  const isGlobalPlayer = 
    player.isGlobal === true || 
    player.isGlobal === "true" || 
    player.discoveredBy === 'API_FOOTBALL' ||
    (player.scoutEmail && currentUserEmail && player.scoutEmail.toLowerCase().trim() !== currentUserEmail);

  const teamKey = player.team ? player.team.toLowerCase().trim() : '';
  const colors = teamColors[teamKey] || { primary: '#2ecc71', secondary: '#1e1e1e', text: '#fff' };
  const displayMarketValue = isGlobalPlayer ? "Keşif Bekleniyor" : calculateMarketValue(player.age, player.rating);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialCommunityIcons name="chevron-left" size={30} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>SCOUT ANALİZİ</Text>
        
        <View style={{flexDirection: 'row', gap: 10}}>
          {!isGlobalPlayer && (
            <TouchableOpacity onPress={() => router.push(`/(tabs)/edit-player?id=${id}`)} style={styles.headerBtn}>
              <MaterialCommunityIcons name="pencil" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => Alert.alert("Bilgi", "PDF Hazırlanıyor...")} style={styles.headerBtn}>
            <MaterialCommunityIcons name="file-pdf-box" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          <TouchableOpacity onPress={pickImage} style={[styles.avatarWrapper, { borderColor: colors.primary }]}>
             {playerImage ? 
                <Image source={{ uri: playerImage }} style={styles.playerImg} /> : 
                <MaterialCommunityIcons name="account" size={80} color="#333" />
             }
             
             {/* 🛡️ SON SAVAŞ: REYTİNG BURADA KESİN ÖLÜR */}
             <View style={[styles.ratingBadge, { backgroundColor: isGlobalPlayer ? '#2980b9' : colors.secondary }]}>
                {isGlobalPlayer ? (
                  <MaterialCommunityIcons name="earth" size={24} color="#fff" />
                ) : (
                  <Text style={[styles.ratingText, { color: colors.primary === '#FFFFFF' ? '#000' : '#fff' }]}>{player.rating}</Text>
                )}
             </View>
          </TouchableOpacity>
          
          <Text style={styles.playerName}>{player.name?.toUpperCase()}</Text>
          <View style={[styles.teamTag, { backgroundColor: colors.primary }]}>
             <Text style={[styles.teamTagText, { color: colors.text }]}>{player.team || 'SERBEST'}</Text>
          </View>

          <View style={styles.tagRow}>
            {player.tags && player.tags.length > 0 ? (
              player.tags.map((tag: string, index: number) => (
                <View key={index} style={[styles.tagBadge, { backgroundColor: colors.primary }]}>
                  <MaterialCommunityIcons name="check-decagram" size={12} color={colors.text} style={{marginRight: 4}} />
                  <Text style={[styles.tagText, { color: colors.text }]}>{tag.toUpperCase()}</Text>
                </View>
              ))
            ) : (
              <Text style={{color: '#444', fontStyle: 'italic', fontSize: 12, marginTop: 10}}>Karakteristik özellik eklenmemiş.</Text>
            )}
          </View>
        </View>

        <View style={styles.statsGrid}>
           <StatBox label="MEVKİ" value={player.position} icon="soccer-field" color={colors.primary} />
           <StatBox label="YAŞ" value={player.age || '20'} icon="calendar-clock" color={colors.primary} />
           <StatBox label="DEĞER" value={displayMarketValue} icon="currency-eur" color={isGlobalPlayer ? '#7f8c8d' : "#2ecc71"} />
           <StatBox label="AYAK" value={player.foot} icon="shoe-print" color={colors.primary} />
           <StatBox label="BOY" value={player.height ? player.height + " cm" : "-"} icon="human-male-height" color={colors.primary} />
           <StatBox label="KİLO" value={player.weight ? player.weight + " kg" : "-"} icon="weight-kilogram" color={colors.primary} />
        </View>

        {isGlobalPlayer ? (
          <TouchableOpacity 
            style={styles.addPortfolioBtn} 
            onPress={() => router.push(`/(tabs)/edit-player?id=${id}&mode=clone`)}
          >
            <MaterialCommunityIcons name="radar" size={24} color="#000" />
            <Text style={styles.addPortfolioBtnText}>Portföyüme Ekle & Not Ver</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.deleteBtn} onPress={deletePlayer}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#e74c3c" />
            <Text style={styles.deleteBtnText}>Raporu Arşivden Sil</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const StatBox = ({ label, value, icon, color }: any) => (
  <View style={styles.statBox}>
    <MaterialCommunityIcons name={icon} size={22} color={color} />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 45 },
  headerTitle: { fontSize: 13, fontWeight: 'bold', letterSpacing: 2 },
  headerBtn: { padding: 5 },
  mainCard: { backgroundColor: '#1e1e1e', alignItems: 'center', paddingVertical: 30, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, elevation: 5 },
  avatarWrapper: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#121212', borderWidth: 4, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  playerImg: { width: '100%', height: '100%', borderRadius: 70 },
  ratingBadge: { position: 'absolute', bottom: -5, right: -5, width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#1e1e1e' },
  ratingText: { fontWeight: 'bold', fontSize: 18 },
  playerName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 15 },
  teamTag: { paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  teamTagText: { fontWeight: 'bold', fontSize: 11 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 20, paddingHorizontal: 25 },
  tagBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, elevation: 2 },
  tagText: { fontSize: 10, fontWeight: '900' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, justifyContent: 'space-between' },
  statBox: { backgroundColor: '#1e1e1e', width: '31%', padding: 15, borderRadius: 20, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: '#2c2c2c' },
  statLabel: { color: '#7f8c8d', fontSize: 9, fontWeight: 'bold', marginTop: 8 },
  statValue: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginTop: 4, textAlign: 'center' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 30, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#e74c3c' },
  deleteBtnText: { color: '#e74c3c', fontWeight: 'bold', marginLeft: 10 },
  addPortfolioBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 30, marginTop: 10, marginBottom: 40, padding: 18, borderRadius: 18, backgroundColor: '#2ecc71', elevation: 4 },
  addPortfolioBtnText: { color: '#000', fontWeight: '900', fontSize: 15, marginLeft: 10, letterSpacing: 0.5 }
});