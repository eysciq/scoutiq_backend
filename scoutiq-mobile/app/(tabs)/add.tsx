import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../constants';

export default function AddPlayerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userRights, setUserRights] = useState(0); // 📅 Haftalık Kalan Hak

  // Form Verileri
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Forvet');
  const [rating, setRating] = useState('');
  const [age, setAge] = useState('');
  const [foot, setFoot] = useState('Sağ');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  // 1. Kullanıcının Kalan Hakkını Çek (Sayfa her açıldığında)
  const fetchUserRights = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${CONFIG.BACKEND_URL}/user-profile/${userId}`);
      const data = await response.json();
      setUserRights(data.weeklyPredictionsLeft);
    } catch (e) {
      console.error("Hak bilgisi çekilemedi.");
    } finally {
      setInitialLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserRights();
    }, [])
  );

  // Etiket Seçme Fonksiyonu (Maksimum 3 adet)
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length < 3) setSelectedTags([...selectedTags, tag]);
      else Alert.alert("Sınır", "En fazla 3 scout etiketi seçebilirsiniz.");
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !rating || !selectedTeam) {
      Alert.alert("Eksik Bilgi", "İsim, Takım ve Reyting zorunludur.");
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      const payload = {
        userId: userId,
        name: name.trim(),
        position,
        rating: parseInt(rating),
        age: parseInt(age),
        foot,
        team: selectedTeam,
        tags: selectedTags
      };

      // 🔥 ARTIK SCOUT ENDPOINT'İNE GİDİYORUZ
      const response = await fetch(`${CONFIG.BACKEND_URL}/scout-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 201) {
        // BAŞARILI KEŞİF (HAK VARDI)
        Alert.alert(
          "Müthiş Keşif! 🎯", 
          `Bu oyuncuyu dünyada ilk bulan ${result.multiplier === 5 ? 'VİZYONER' : result.discoveryOrder + '.'} kişisin!`,
          [{ text: "Portföye Git", onPress: () => router.replace('/index') }]
        );
      } else if (response.status === 403) {
        // ⛔ HAK BİTTİ - NOT DEFTERİ YÖNLENDİRMESİ
        Alert.alert(
          "Haftalık Hakkın Doldu!",
          "Bu oyuncuyu kaybetmek istemiyorsan Not Defterine kaydedelim mi?",
          [
            { text: "Vazgeç", style: 'cancel' },
            { text: "Not Defterine Ekle", onPress: () => handleSaveToNotebook(payload) }
          ]
        );
      } else {
        Alert.alert("Hata", result.error || "Bir şeyler ters gitti.");
      }
    } catch (e) {
      Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToNotebook = async (payload: any) => {
    try {
      await fetch(`${CONFIG.BACKEND_URL}/save-notebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      router.replace('/notebook');
    } catch (e) {
      Alert.alert("Hata", "Not defterine kaydedilemedi.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER + HAK GÖSTERGESİ */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Yeni Keşif</Text>
          <View style={[styles.rightsBadge, { backgroundColor: userRights > 0 ? '#2ecc71' : '#e74c3c' }]}>
            <Text style={styles.rightsText}>{userRights}/2 HAK</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>Nijerya'dan Real Madrid'e uzanan yol burada başlar.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.label}>OYUNCU ADI</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Örn: Arda Güler" 
            placeholderTextColor="#555" 
            value={name} 
            onChangeText={setName} 
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>REYTING (0-99)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={rating} 
                onChangeText={setRating} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>TAKIM</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Örn: Real Madrid" 
                placeholderTextColor="#555" 
                value={selectedTeam} 
                onChangeText={setSelectedTeam} 
              />
            </View>
          </View>

          <Text style={styles.label}>SCOUT ETİKETLERİ (Maks. 3)</Text>
          <View style={styles.tagRow}>
            {['Hızlı', 'Teknik', 'Bitirici', 'Lider', 'Fizikli'].map(tag => (
              <TouchableOpacity 
                key={tag} 
                style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleSave} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#000" /> : (
            <Text style={styles.saveButtonText}>RADARA AL 📡</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: { padding: 25, backgroundColor: '#1a1a1a', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  headerSub: { color: '#7f8c8d', fontSize: 12, marginTop: 5, fontWeight: '600' },
  rightsBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  rightsText: { color: '#000', fontSize: 11, fontWeight: '900' },
  formContainer: { padding: 20 },
  formCard: { backgroundColor: '#1a1a1a', padding: 20, borderRadius: 25, borderWidth: 1, borderColor: '#333' },
  label: { color: '#2ecc71', fontSize: 10, fontWeight: '900', marginBottom: 10, marginTop: 15, letterSpacing: 1 },
  input: { backgroundColor: '#262626', color: '#fff', padding: 15, borderRadius: 15, fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#262626', borderWidth: 1, borderColor: '#333' },
  tagChipActive: { backgroundColor: 'rgba(46, 204, 113, 0.2)', borderColor: '#2ecc71' },
  tagText: { color: '#7f8c8d', fontSize: 12, fontWeight: 'bold' },
  tagTextActive: { color: '#2ecc71' },
  saveButton: { backgroundColor: '#2ecc71', height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 30, elevation: 10 },
  saveButtonText: { color: '#000', fontSize: 18, fontWeight: '900', letterSpacing: 1 }
});