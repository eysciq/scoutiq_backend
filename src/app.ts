import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';

// 🤵‍♂️ Rotaları (Routes) İçeri Alıyoruz
import authRoutes from './routes/authRoutes';
import playerRoutes from './routes/playerRoutes';

const app = express();

// 🛡️ GÜVENLİK VE AYARLAR
app.use(helmet());

// 🔥 KRİTİK DÜZELTME: Mobilden gelen isteklerin reddedilmemesi için CORS'u esnetiyoruz
app.use(cors({
  origin: '*', // Geliştirme aşamasında her yerden gelen isteğe izin ver
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 🚦 TRAFİK YÖNLENDİRME
// Not: '/' kullanımı çakışma riskini artırabilir, istersen başına '/api' ekleyebilirsin
app.use('/', authRoutes); 
app.use('/', playerRoutes);

// =================================================================
// 🌍 FUTBOL VERİ HAVUZU (Statik Listeler)
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
  },
  { 
    country: "İspanya", 
    leagues: [ 
      { name: "La Liga", teams: ["Real Madrid", "Barcelona", "Atletico Madrid", "Girona", "Real Sociedad", "Villarreal"] } 
    ] 
  }
];

// 📡 Dinamik Veri API'ları (AddPlayer ekranı için)
app.get('/countries', (req: Request, res: Response) => {
  res.json(footballData.map(d => d.country));
});

app.get('/leagues', (req: Request, res: Response) => {
  const { country } = req.query;
  const data = footballData.find(d => d.country === country);
  res.json(data ? data.leagues.map(l => l.name) : []);
});

app.get('/teams', (req: Request, res: Response) => {
  const { country, league } = req.query;
  const cData = footballData.find(d => d.country === country);
  const lData = cData?.leagues.find(l => l.name === league);
  res.json(lData ? lData.teams : []);
});

// 🚀 Sağlık Kontrolü (Sunucu ayakta mı?)
app.get('/status', (req, res) => res.json({ status: 'ScoutIQ Online 🟢' }));

export default app;