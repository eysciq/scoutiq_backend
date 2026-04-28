import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 🔥 DÜZELTME: Sabit IP yerine dinamik CONFIG kullanıyoruz
import { CONFIG } from '../../constants';

// 🏷️ HAZIR SCOUT ETİKETLERİ HAVUZU
const PREDEFINED_TAGS = ['Hızlı', 'Hava Topu', 'Oyun Kurucu', 'Lider', 'Bitirici', 'Agresif', 'Çalışkan', 'Sakatlığa Meyilli', 'Teknik', 'Dinamik'];

// 🎨 TAKIM RENK KÜTÜPHANESİ
const teamColors: { [key: string]: { primary: string, secondary: string, text: string } } = {
  'Galatasaray': { primary: '#A90432', secondary: '#FDB912', text: '#fff' },
  'Fenerbahçe': { primary: '#002347', secondary: '#FEDD00', text: '#fff' },
  'Beşiktaş': { primary: '#000000', secondary: '#FFFFFF', text: '#fff' },
  'Trabzonspor': { primary: '#800020', secondary: '#2196F3', text: '#fff' },
  'Erzurumspor': { primary: '#005696', secondary: '#FFFFFF', text: '#fff' },
  'Başakşehir': { primary: '#004A99', secondary: '#ED7102', text: '#fff' },
  'Kasımpaşa': { primary: '#005CAB', secondary: '#FFFFFF', text: '#fff' },
  'Eyüpspor': { primary: '#601F7F', secondary: '#F1C40F', text: '#fff' },
  'Samsunspor': { primary: '#E30613', secondary: '#FFFFFF', text: '#fff' },
  'Göztepe': { primary: '#FDB912', secondary: '#E30613', text: '#000' },
  'Real Madrid': { primary: '#FFFFFF', secondary: '#FEBE10', text: '#000' },
  'Barcelona': { primary: '#004D98', secondary: '#A50044', text: '#fff' },
  'Manchester City': { primary: '#6CABDD', secondary: '#FFFFFF', text: '#000' },
  'Arsenal': { primary: '#EF0107', secondary: '#FFFFFF', text: '#fff' },
};

export default function EditPlayerScreen() {
  const { id, mode } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form Verileri
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Forvet');
  const [rating, setRating] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [foot, setFoot] = useState('Sağ');
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [countries, setCountries] = useState<string[]>([]);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);

  const positions = ['Forvet', 'Orta Saha', 'Defans', 'Kaleci'];
  const feet = ['Sağ', 'Sol', 'İki Ayak'];

  // 📡 Veri Çekme Mantığı
  const fetchInitialData = async () => {
    try {
      const cRes = await fetch(`${CONFIG.BACKEND_URL}/countries`);
      const cData = await cRes.json();
      setCountries(cData);

      if (id) {
        const pRes = await fetch(`${CONFIG.BACKEND_URL}/player-details/${id}`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setName(pData.name || '');
          setPosition(pData.position || 'Forvet');
          setRating(mode === 'clone' ? '' : (pData.rating ? String(pData.rating) : ''));
          setAge(pData.age ? String(pData.age) : '');
          setHeight(pData.height ? String(pData.height) : '');
          setWeight(pData.weight ? String(pData.weight) : '');
          setFoot(pData.foot || 'Sağ');
          
          if (pData.country) {
            setSelectedCountry(pData.country);
            const lRes = await fetch(`${CONFIG.BACKEND_URL}/leagues?country=${pData.country}`);
            setLeagues(await lRes.json());
          }
          if (pData.league) {
            setSelectedLeague(pData.league);
            const tRes = await fetch(`${CONFIG.BACKEND_URL}/teams?country=${pData.country}&league=${pData.league}`);
            setTeams(await tRes.json());
          }
          if (pData.team) setSelectedTeam(pData.team);

          // 🔥 DÜZELTME: Backend'den string gelirse diziye çeviriyoruz
          const tagsArray = Array.isArray(pData.tags) 
            ? pData.tags 
            : (typeof pData.tags === 'string' ? pData.tags.split(',').filter((t: string) => t !== "") : []);
          setSelectedTags(tagsArray);
        }
      }
    } catch (e) {
      console.log("Veri çekme hatası:", e);
    } finally {
      setInitialLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchInitialData(); }, [id]));

  // 🏷️ Etiket Yönetimi
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length >= 3) {
        Alert.alert("Sınır Aşıldı", "En fazla 3 karakteristik özellik ekleyebilirsiniz.");
        return;
      }
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country); setSelectedLeague(''); setSelectedTeam('');
    fetch(`${CONFIG.BACKEND_URL}/leagues?country=${country}`).then(res => res.json()).then(data => setLeagues(data));
  };

  const handleLeagueChange = (league: string) => {
    setSelectedLeague(league); setSelectedTeam('');
    fetch(`${CONFIG.BACKEND_URL}/teams?country=${selectedCountry}&league=${league}`).then(res => res.json()).then(data => setTeams(data));
  };

  const getTeamButtonStyle = (tName: string) => {
    if (selectedTeam !== tName) return styles.teamBtn;
    const colors = teamColors[tName];
    if (colors) return [styles.teamBtn, { backgroundColor: colors.primary, borderColor: colors.secondary, borderWidth: 2.5 }];
    return [styles.teamBtn, styles.teamBtnActive];
  };

  // 🔥 ASIL DÜZELTME: Kayıt ve Güncelleme Mantığı
  const handleUpdate = async () => {
    if (!name.trim() || !rating || !selectedTeam) {
      Alert.alert("Eksik Bilgi", "Lütfen İsim, Takım ve Potansiyel alanlarını doldurun.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        position,
        rating: parseInt(rating) || 0, // 🔥 DÜZELTME: Prisma Integer bekliyor
        age: age ? parseInt(age) : null,
        height: height ? parseInt(height) : null,
        weight: weight ? parseInt(weight) : null,
        foot,
        team: selectedTeam,
        league: selectedLeague || "Bilinmiyor",
        country: selectedCountry || "Bilinmiyor",
        tags: selectedTags.join(',') // 🔥 DÜZELTME: Virgülle ayrılmış string olarak kaydediyoruz
      };

      if (mode === 'clone') {
        const rawEmail = await AsyncStorage.getItem('userEmail');
        const scoutEmail = rawEmail ? rawEmail.toLowerCase().trim() : 'misafir@scoutiq.com';

        const response = await fetch(`${CONFIG.BACKEND_URL}/add-player`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, scoutEmail }),
        });

        if (response.ok) {
          Alert.alert("Keşif Başarılı! 🎯", `${name} portföyüne alındı.`, [
            { text: "Tamam", onPress: () => router.replace('/') }
          ]);
        } else {
          const err = await response.json();
          Alert.alert("Hata", err.message || "Reddedildi.");
        }
      } 
      else {
        const response = await fetch(`${CONFIG.BACKEND_URL}/update-player/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          Alert.alert("Başarılı! 🔄", "Rapor güncellendi.", [{ text: "Tamam", onPress: () => router.back() }]);
        } else {
          Alert.alert("Hata", "Güncellenemedi.");
        }
      }
    } catch (e) {
      Alert.alert("Hata", "Bağlantı kesildi. IP adresinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#3498db" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{position: 'absolute', left: 20, top: 45}}>
           <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{mode === 'clone' ? 'Portföyüme Ekle' : 'Raporu Güncelle'}</Text>
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

          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>OYUNCU KARAKTERİSTİĞİ (En Fazla 3)</Text>
            <View style={styles.chipRow}>
              {PREDEFINED_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity key={tag} style={[styles.tagChip, isSelected && styles.tagChipActive]} onPress={() => toggleTag(tag)}>
                    <MaterialCommunityIcons name={isSelected ? "check-circle" : "plus-circle-outline"} size={14} color={isSelected ? "#000" : "#95a5a6"} style={{marginRight: 4}} />
                    <Text style={[styles.tagChipText, isSelected && styles.tagChipTextActive]}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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

          <Text style={styles.label}>FİZİKSEL VERİLER</Text>
          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
              <TextInput style={styles.input} placeholder="Boy" keyboardType="numeric" value={height} onChangeText={setHeight} maxLength={3} />
            </View>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <TextInput style={styles.input} placeholder="Kilo" keyboardType="numeric" value={weight} onChangeText={setWeight} maxLength={3} />
            </View>
          </View>

          <Text style={styles.label}>AYAK</Text>
          <View style={styles.chipRow}>
            {feet.map(f => (
              <TouchableOpacity key={f} style={[styles.chip, foot === f && styles.chipActive]} onPress={() => setFoot(f)}>
                <Text style={[styles.chipText, foot === f && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: mode === 'clone' ? '#2ecc71' : '#3498db' }]} onPress={handleUpdate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <MaterialCommunityIcons name={mode === 'clone' ? "folder-plus" : "content-save-edit"} size={24} color={mode === 'clone' ? "#000" : "#fff"} style={{ marginRight: 10 }} />
              <Text style={[styles.saveButtonText, { color: mode === 'clone' ? "#000" : "#fff" }]}>{mode === 'clone' ? 'Portföyüme Kaydet' : 'Güncelle'}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Bütün stiller eksiksiz burada, hiçbir şey bozulmayacak!
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  header: { padding: 30, paddingTop: 45, backgroundColor: '#1e1e1e', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  formContainer: { padding: 20, paddingBottom: 50 },
  formCard: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 25, borderWidth: 1, borderColor: '#333' },
  label: { color: '#3498db', fontSize: 11, fontWeight: 'bold', marginBottom: 12, marginTop: 15, letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c2c2c', borderRadius: 12, paddingHorizontal: 15, height: 50, marginBottom: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444' },
  chipActive: { backgroundColor: '#3498db', borderColor: '#3498db' },
  chipText: { color: '#95a5a6', fontSize: 13, fontWeight: 'bold' },
  chipTextActive: { color: '#fff' },
  tagsContainer: { marginTop: 15, padding: 15, backgroundColor: '#252525', borderRadius: 15, borderWidth: 1, borderColor: '#444' },
  tagsLabel: { color: '#f1c40f', fontSize: 11, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1 },
  tagChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#555' },
  tagChipActive: { backgroundColor: '#f1c40f', borderColor: '#f1c40f' },
  tagChipText: { color: '#95a5a6', fontSize: 12, fontWeight: 'bold' },
  tagChipTextActive: { color: '#000' },
  teamScroll: { flexDirection: 'row', marginBottom: 10 },
  teamBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 15, backgroundColor: '#2c2c2c', marginRight: 10, borderWidth: 1, borderColor: '#444', alignItems: 'center', minWidth: 100 },
  teamBtnActive: { backgroundColor: '#f1c40f', borderColor: '#f1c40f' },
  teamBtnText: { color: '#95a5a6', fontSize: 14, fontWeight: 'bold' },
  saveButton: { flexDirection: 'row', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 25 },
  saveButtonText: { fontSize: 18, fontWeight: 'bold' }
});