import app from './app';
import os from 'os';

const PORT = 3001;

// 📡 Yerel IP Adresini Otomatik Bulan Fonksiyon
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

const CURRENT_IP = getLocalIP();

// 🚀 Sunucuyu Başlat (0.0.0.0 her yerden erişim sağlar)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n\x1b[32m========================================\x1b[0m`);
  console.log(`\x1b[1m⚽ ScoutIQ Backend SİSTEMİ AKTİF!\x1b[0m`);
  console.log(`📡 Sunucu IP: \x1b[36m${CURRENT_IP}\x1b[0m`);
  console.log(`🔌 Port: \x1b[33m${PORT}\x1b[0m`);
  console.log(`\x1b[32m========================================\x1b[0m\n`);
  
  console.log(`💡 Mobildeki CONFIG dosyasında IP'nin \x1b[36m${CURRENT_IP}\x1b[0m olduğundan emin ol!\n`);
});