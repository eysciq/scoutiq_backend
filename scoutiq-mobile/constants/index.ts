// Dosya Yolu: scoutiq-mobile/constants/index.ts

// 🌐 SİSTEM AYARLARI
export const CONFIG = {
  // ⚠️ KRİTİK: Wi-Fi değiştikçe SADECE BURAYI güncelleyeceksin!
  // Android Emulator için 'http://10.0.2.2:3001' gerekebilir.
  BACKEND_URL: 'http://192.168.1.181:3001', 
};

// 🏷️ SCOUT ETİKETLERİ
export const PREDEFINED_TAGS = [
  'Hızlı', 'Hava Topu', 'Oyun Kurucu', 'Lider', 'Bitirici', 
  'Agresif', 'Çalışkan', 'Sakatlığa Meyilli', 'Teknik', 'Dinamik'
];

// 🎨 TAKIM RENK KÜTÜPHANESİ
// Tüm anahtarlar (keys) küçük harf olmalı (Case-insensitive eşleşme için)
export const TEAM_COLORS: { [key: string]: { primary: string, secondary: string, text: string } } = {
  // 🇹🇷 Türkiye
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
  'antalyaspor': { primary: '#E30613', secondary: '#FFFFFF', text: '#fff' },
  
  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 İngiltere
  'manchester city': { primary: '#6CABDD', secondary: '#1C2C5B', text: '#fff' },
  'arsenal': { primary: '#EF0107', secondary: '#9C824A', text: '#fff' },
  'liverpool': { primary: '#C8102E', secondary: '#00B2A9', text: '#fff' },
  'manchester united': { primary: '#DA291C', secondary: '#FBE122', text: '#fff' },
  'chelsea': { primary: '#034694', secondary: '#DBA111', text: '#fff' },
  
  // 🇪🇸 İspanya
  'real madrid': { primary: '#FFFFFF', secondary: '#FEBE10', text: '#000' },
  'barcelona': { primary: '#004D98', secondary: '#A50044', text: '#fff' },
  'atletico madrid': { primary: '#CB3524', secondary: '#1D2D50', text: '#fff' },

  // 🇩🇪 Almanya & 🇮🇹 İtalya
  'bayern münih': { primary: '#DC052D', secondary: '#0066B2', text: '#fff' },
  'borussia dortmund': { primary: '#FDE100', secondary: '#000000', text: '#000' },
  'inter': { primary: '#0053A0', secondary: '#000000', text: '#fff' },
  'milan': { primary: '#FB090B', secondary: '#000000', text: '#fff' },
  'juventus': { primary: '#000000', secondary: '#FFFFFF', text: '#fff' },
};