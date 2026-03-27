import { Platform } from 'react-native';

/**
 * ScoutIQ Profesyonel Renk Paleti
 * Ana Yeşil: #2ecc71 (Başarı ve Aksiyon)
 * Arka Plan: #121212 (Derin Siyah)
 * Kartlar: #1e1e1e (Vurgulu Gri)
 */

const scoutGreen = '#2ecc71';
const scoutBlue = '#3498db';
const scoutYellow = '#f1c40f';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F5F6FA', // Göz yormayan açık gri/beyaz
    tint: scoutGreen,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: scoutGreen,
  },
  dark: {
    text: '#FFFFFF',
    background: '#121212', // Senin kullandığın ana siyah
    tint: scoutGreen,
    icon: '#9BA1A6',
    tabIconDefault: '#444444',
    tabIconSelected: scoutGreen,
    card: '#1e1e1e', // Kartlar için özel vurgu rengi
    border: '#333333',
    error: '#e74c3c',
    warning: scoutYellow,
    info: scoutBlue
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