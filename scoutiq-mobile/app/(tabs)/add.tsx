import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../constants'; // Merkezi IP yönetimi

// 🎨 DEV TAKIM RENK KÜTÜPHANESİ (Senin listen)
const teamColors: { [key: string]: { primary: string, secondary: string, text: string } } = {
  'Galatasaray': { primary: '#A90432', secondary: '#FDB912', text: '#fff' },
  'Fenerbahçe': { primary: '#002347', secondary: '#FEDD00', text: '#fff' },
  'Beşiktaş': { primary: '#000000', secondary: '#FFFFFF', text: '#fff' },
  'Trabzonspor': { primary: '#800020', secondary: '#2196F3', text: '#fff' },
  'Real Madrid': { primary: '#FFFFFF', secondary: '#FEBE10', text: '#000' },
  'Barcelona': { primary: '#004D98', secondary: '#A50044', text: '#fff' },
  'Manchester City': { primary: '#6CABDD', secondary: '#FFFFFF', text: '#000' },
  'Arsenal': { primary: '#EF0107', secondary: '#FFFFFF', text: '#fff' },
  // ... (Diğer takımların buraya eklenebilir)
};

export default function AddPlayerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form Verileri
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Forvet');
  const [rating, setRating] = useState('');
  const [age, setAge] = useState('');
  const [foot, setFoot] = useState('Sağ');

  // Dinamik Listeler
  const [countries, setCountries] = useState<string[]>([]);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);

  // Seçili Değerler
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  const positions = ['Forvet', 'Orta Saha', 'Defans', 'Kaleci'];
  const feet = ['Sağ', 'Sol', 'İki Ayak'];

  // 📡 Ülkeleri Açılışta Getir
  useEffect(() => {
    fetch(`${CONFIG.BACKEND_URL}/countries`)
      .then(res => res.json())
      .then(data => { setCountries(data); setInitialLoading(false); })
      .catch(() => setInitialLoading(false));
  }, []);

  // 📡 Ülke Değişince Ligleri Getir
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country); setSelectedLeague(''); setSelectedTeam('');
    fetch(`${CONFIG.BACKEND_URL}/leagues?country=${country}`).then(res => res.json()).then(data => setLeagues(data));
  };

  // 📡 Lig Değişince Takımları Getir
  const handleLeagueChange = (league: string) => {
    setSelectedLeague(league); setSelectedTeam('');
    fetch(`${CONFIG.BACKEND_URL}/teams?country=${selectedCountry}&league=${league}`).then(res => res.json()).then(data => setTeams(data));
  };

  // 🪄 Takım Rengi Uygulayıcı
  const getTeamButtonStyle = (tName: string) => {
    if (selectedTeam !== tName) return styles.teamBtn;
    const colors = teamColors[tName];
    if (colors) {
      return [styles.teamBtn, { backgroundColor: colors.primary, borderColor: colors.secondary, borderWidth: 2.5 }];
    }
    return [styles.teamBtn, styles.teamBtnActive];
  };

  const handleSave = async () => {
    if (!name.trim() || !rating || !selectedTeam) {
      Alert.alert("Eksik Bilgi", "Lütfen en azından İsim, Takım ve Reyting girin.");
      return;
    }

    setLoading(true);
    try {
      const rawEmail = await AsyncStorage.getItem('userEmail');
      const scoutEmail = rawEmail ? rawEmail.toLowerCase().trim() : 'misafir@scoutiq.com';

      // 🔥 HATAYI BİTİREN KISIM: Veri tiplerini Postgres (Int?) ve Prisma'ya göre zorluyoruz
      const payload = {
        name: name.trim(),
        position: position,
        rating: rating.toString(), // password alanında string olarak birleşecek
        age: age ? parseInt(age) : null, // Backend Int? beklediği için sayıya zorladık
        foot: foot,
        scoutEmail: scoutEmail,
        team: selectedTeam,
        league: selectedLeague || "Bilinmiyor",
        country: selectedCountry || "Bilinmiyor",
        tags: "" // Hata riskini sıfırlamak için şimdilik boş string
      };

      const response = await fetch(`${CONFIG.BACKEND_URL}/add-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Başarılı! 🎯", `${name} portföyüne eklendi.`, [
          { text: "Tamam", onPress: () => router.replace('/') } 
        ]);
        setName(''); setRating(''); setSelectedTeam(''); setAge('');
      } else {
        Alert.alert("Kayıt Hatası", result.error || "Sunucu kaydı reddetti.");
      }
    } catch (e) {
      Alert.alert("Hata", "Sunucuya bağlanılamadı. IP adresini kontrol et.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <MaterialCommunityIcons name="soccer" size={40} color="#2ecc71" />
        <Text style={styles.headerTitle}>Yeni Yetenek Raporu</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.label}>OYUNCU ADI</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="account" size={20} color="#95a5a6" style={{marginRight: 10}} />
            <TextInput style={styles.input} placeholder="Ad Soyad" placeholderTextColor="#7f8c8d" value={name} onChangeText={setName} />
          </View>

          <Text style={styles.label}>ÜLKE VE LİG</Text>
          <View style={styles.chipRow}>
            {countries.map(c => (
              <TouchableOpacity key={c} style={[styles.chip, selectedCountry === c && styles.chipActive]} onPress={() => handleCountryChange(c)}>
                <Text style={[styles.chipText, selectedCountry === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedCountry && (
            <View style={[styles.chipRow, { marginTop: 10 }]}>
              {leagues.map(l => (
                <TouchableOpacity key={l} style={[styles.chip, selectedLeague === l && styles.chipActive]} onPress={() => handleLeagueChange(l)}>
                  <Text style={[styles.chipText, selectedLeague === l && styles.chipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedLeague && (
            <>
              <Text style={styles.label}>TAKIMINI SEÇ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamScroll}>
                {teams.map(t => (
                  <TouchableOpacity key={t} style={getTeamButtonStyle(t)} onPress={() => setSelectedTeam(t)}>
                    <Text style={[styles.teamBtnText, selectedTeam === t && { color: teamColors[t]?.text || '#121212' }]}>{t}</Text>
                    {selectedTeam === t && teamColors[t] && (
                      <View style={{ height: 4, backgroundColor: teamColors[t].secondary, width: '110%', marginTop: 5, borderRadius: 2 }} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <Text style={styles.label}>MEVKİ</Text>
          <View style={styles.chipRow}>
            {positions.map(p => (
              <TouchableOpacity key={p} style={[styles.chip, position === p && styles.chipActive]} onPress={() => setPosition(p)}>
                <Text style={[styles.chipText, position === p && styles.chipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>POTANSİYEL & YAŞ</Text>
          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
              <MaterialCommunityIcons name="star" size={18} color="#f1c40f" />
              <TextInput style={styles.input} placeholder="Pot." keyboardType="numeric" value={rating} onChangeText={setRating} maxLength={2} />
            </View>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <TextInput style={styles.input} placeholder="Yaş" keyboardType="numeric" value={age} onChangeText={setAge} maxLength={2} />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : (
            <>
              <MaterialCommunityIcons name="content-save-check" size={24} color="#000" style={{ marginRight: 10 }} />
              <Text style={styles.saveButtonText}>Sisteme Kaydet</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 30, paddingTop: 40, backgroundColor: '#1e1e1e', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  formContainer: { padding: 20, paddingBottom: 50 },
  formCard: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 25, borderWidth: 1, borderColor: '#333' },
  label: { color: '#2ecc71', fontSize: 11, fontWeight: 'bold', marginBottom: 12, marginTop: 15, letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c2c2c', borderRadius: 12, paddingHorizontal: 15, height: 50, marginBottom: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444' },
  chipActive: { backgroundColor: '#2ecc71', borderColor: '#2ecc71' },
  chipText: { color: '#95a5a6', fontSize: 13, fontWeight: 'bold' },
  chipTextActive: { color: '#121212' },
  teamScroll: { flexDirection: 'row', marginBottom: 10 },
  teamBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 15, backgroundColor: '#2c2c2c', marginRight: 10, borderWidth: 1, borderColor: '#444', alignItems: 'center', minWidth: 100 },
  teamBtnActive: { backgroundColor: '#f1c40f', borderColor: '#f1c40f' },
  teamBtnText: { color: '#95a5a6', fontSize: 14, fontWeight: 'bold' },
  saveButton: { flexDirection: 'row', backgroundColor: '#2ecc71', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 25 },
  saveButtonText: { color: '#121212', fontSize: 18, fontWeight: 'bold' }
});