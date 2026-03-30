import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit'; // 🛡️ API Koruması

// 🤵‍♂️ Rotaları İçeri Alıyoruz
import authRoutes from './routes/authRoutes';
import playerRoutes from './routes/playerRoutes';
import reportRoutes from './routes/reportRoutes'; // <-- YENİ: Beyin takımının rotası

const app = express();

// =================================================================
// 🛡️ GÜVENLİK VE AYARLAR
// =================================================================
app.use(helmet());

// 🔥 KRİTİK: Mobilden (Expo) gelen isteklerin engellenmemesi için CORS ayarı
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON formatındaki verileri okuyabilmek için limit koyuyoruz (DoS koruması)
app.use(express.json({ limit: '10kb' }));

// 🛑 Hız Sınırı (BURASI DÜZELTİLDİ: Artık düz metin değil, JSON formatında yanıt dönüyor)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına en fazla 100 istek
  message: { error: "Çok fazla istek attınız, lütfen biraz bekleyin." } // <-- SÜSLÜ PARANTEZE ALINDI
});
// Sadece /api ile başlayan rotaları korumaya alıyoruz
app.use('/api/', limiter);

// =================================================================
// 🚦 TRAFİK YÖNLENDİRME (Rotalar)
// =================================================================
app.use('/auth', authRoutes);           // Örn: /auth/login
app.use('/api', playerRoutes);          // Örn: /api/players (Eski portföy vs.)
app.use('/api/reports', reportRoutes);  // <-- YENİ: Mobildeki "Sisteme Kaydet" butonu buraya gelecek!

// =================================================================
// 🌍 FUTBOL VERİ HAVUZU (AddPlayer ekranı için statik listeler)
// =================================================================
const footballData = [
  { 
    country: "Türkiye", 
    leagues: [ 
      { name: "Trendyol Süper Lig", teams: ["Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor", "Eyüpspor", "Samsunspor", "Göztepe", "Başakşehir", "Kasımpaşa", "Antalyaspor"] }, 
      { name: "Trendyol 1. Lig", teams: ["Kocaelispor", "Bandırmaspor", "Erzurumspor", "Iğdır FK", "Gençlerbirliği", "MKE Ankaragücü"] } 
    ] 
  },
  { 
    country: "İngiltere", 
    leagues: [ 
      { name: "Premier League", teams: ["Man City", "Liverpool", "Arsenal", "Chelsea", "Man United", "Tottenham", "Aston Villa"] }, 
      { name: "Championship", teams: ["Burnley", "Leeds", "Sheffield Utd", "Hull City", "Sunderland"] } 
    ] 
  }
];

// 📡 Ülke, Lig ve Takım Seçimi İçin API'lar
app.get('/countries', (req: Request, res: Response) => {
  res.json(footballData.map(d => d.country));
});

app.get('/leagues', (req: Request, res: Response) => {
  const country = req.query.country as string;
  const data = footballData.find(d => d.country === country);
  res.json(data ? data.leagues.map(l => l.name) : []);
});

app.get('/teams', (req: Request, res: Response) => {
  const country = req.query.country as string;
  const league = req.query.league as string;
  const cData = footballData.find(d => d.country === country);
  const lData = cData?.leagues.find(l => l.name === league);
  res.json(lData ? lData.teams : []);
});

// 🚀 Sağlık Kontrolü (Sunucu ayakta mı?)
app.get('/status', (req: Request, res: Response) => {
  res.json({ status: 'ScoutIQ Online 🟢' });
});

export default app;