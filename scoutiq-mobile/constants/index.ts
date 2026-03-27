// Dosya Yolu: scoutiq-mobile/constants/index.ts

// 🌐 SİSTEM AYARLARI
export const CONFIG = {
  // Wi-Fi değiştikçe SADECE BURAYI güncelleyeceksin!
  BACKEND_URL: 'http://192.168.1.181:3001', 
};

// 🏷️ SCOUT ETİKETLERİ (Uygulamanın her yerinde aynı etiketler görünsün diye)
export const PREDEFINED_TAGS = [
  'Hızlı', 'Hava Topu', 'Oyun Kurucu', 'Lider', 'Bitirici', 
  'Agresif', 'Çalışkan', 'Sakatlığa Meyilli', 'Teknik', 'Dinamik'
];

// 🎨 TAKIM RENK KÜTÜPHANESİ (Frontend tasarımdaki dinamik renkler buradan besleniyor)
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
  
  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 İngiltere
  'manchester city': { primary: '#6CABDD', secondary: '#FFFFFF', text: '#000' },
  'arsenal': { primary: '#EF0107', secondary: '#FFFFFF', text: '#fff' },
  'liverpool': { primary: '#C8102E', secondary: '#F6EB61', text: '#fff' },
  
  // 🇪🇸 İspanya
  'real madrid': { primary: '#FFFFFF', secondary: '#FEBE10', text: '#000' },
  'barcelona': { primary: '#004D98', secondary: '#A50044', text: '#fff' },
};