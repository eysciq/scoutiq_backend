import { Platform } from 'react-native';

/**
 * ⚽ ScoutIQ Profesyonel Renk Paleti
 * Ana Yeşil: #2ecc71 (Başarı, Potansiyel ve Aksiyon)
 * Arka Plan: #121212 (Modern Karanlık Tema)
 * Vurgu: #1e1e1e (Kart Tasarımları)
 */

const scoutGreen = '#2ecc71';
const scoutBlue = '#3498db';
const scoutYellow = '#f1c40f';
const scoutRed = '#e74c3c';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F5F6FA',
    tint: scoutGreen,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: scoutGreen,
  },
  dark: {
    text: '#FFFFFF',
    background: '#121212',
    tint: scoutGreen,
    icon: '#9BA1A6',
    tabIconDefault: '#444444',
    tabIconSelected: scoutGreen,
    card: '#1e1e1e', // Kartlar için özel vurgu rengi
    border: '#333333',
    error: scoutRed,
    warning: scoutYellow,
    info: scoutBlue,
    success: scoutGreen,
    // 🔥 YENİ: Gölge ve Alt Katmanlar için
    overlay: 'rgba(0,0,0,0.85)',
    subtext: '#95a5a6'
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Tip güvenliği için yardımcı sabitler
export const SHADOWS = {
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  }
};