import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

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

// 🧭 SEÇİM ROTARI
app.get('/countries', (req: Request, res: Response) => res.json(footballData.map(d => d.country)));
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

// =================================================================
// 👤 KULLANICI YÖNETİMİ
// =================================================================

app.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await prisma.user.create({ data: { email: cleanEmail, password: hashedPassword, scoutScore: 0, reportsCount: 0 } });
    res.json({ message: "Kayıt başarılı" });
  } catch (error) { res.status(400).json({ message: "E-posta kullanımda!" }); }
});

app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "Hatalı!" });
    res.json({ message: "Başarılı", scoutScore: user.scoutScore, email: user.email });
  } catch (error) { res.status(500).send(); }
});

app.get('/my-profile', async (req: Request, res: Response) => {
  const { email } = req.query;
  try {
    const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    if (user) res.json({ score: user.scoutScore, count: user.reportsCount });
    else res.status(404).json({ message: "Bulunamadı" });
  } catch (error) { res.status(500).send(); }
});

// =================================================================
// ⚽ OYUNCU İŞLEMLERİ
// =================================================================

// 1. OYUNCU EKLE
app.post('/add-player', async (req: Request, res: Response) => {
  const { name, position, rating, age, height, weight, foot, scoutEmail, country, league, team, tags } = req.body;
  try {
    const cleanScoutEmail = scoutEmail?.trim().toLowerCase();

    await prisma.user.create({
      data: {
        email: `player_${Date.now()}@scoutiq.com`,
        password: `${name}|${position}|${rating}`,
        discoveredBy: cleanScoutEmail,
        age: age ? Number(age) : null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        foot: foot || null,
        isGlobal: false,
        country: country || null,
        league: league || null,
        team: team || null,
        tags: tags || [] // 🔥 Etiketler eklendi
      },
    });

    if (cleanScoutEmail) {
      await prisma.user.update({
        where: { email: cleanScoutEmail },
        data: { scoutScore: { increment: 10 }, reportsCount: { increment: 1 } }
      });
    }
    res.json({ message: "Başarılı" });
  } catch (error) { 
    console.error("❌ Ekleme Hatası:", error);
    res.status(400).json({ message: "Kaydedilemedi." }); 
  }
});

// 2. PORTFÖY LİSTESİ
app.get('/players', async (req: Request, res: Response) => {
  const { scoutEmail } = req.query;
  try {
    const players = await prisma.user.findMany({
      where: { 
        email: { startsWith: 'player_' }, 
        discoveredBy: scoutEmail ? String(scoutEmail).trim().toLowerCase() : "misafir",
        isGlobal: false 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(players.map(u => {
      const [name, pos, rat] = (u.password || "").split('|');
      return { 
        id: u.id, name, position: pos, rating: rat, 
        team: u.team, league: u.league, country: u.country,
        isGlobal: false // Kendi raporlarımızda sayı görünecek
      };
    }));
  } catch (error) { res.status(500).send(); }
});

// 3. KEŞFET LİSTESİ (Sadece Global Yıldızlar)
app.get('/global-players', async (req: Request, res: Response) => {
  try {
    const players = await prisma.user.findMany({
      where: { isGlobal: true },
      take: 20
    });
    res.json(players.map(u => {
      const [name, pos, rat] = (u.password || "").split('|');
      // 🔥 DÜZELTME: Global oyuncuda rating gönderiliyor ama isGlobal: true bayrağı ekleniyor
      return { id: u.id, name, position: pos, rating: rat, team: u.team || "Global Star", isGlobal: true };
    }));
  } catch (error) { res.status(500).send(); }
});

// 4. DETAY
app.get('/player-details/:id', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
    if (!user) return res.status(404).json({ message: "Oyuncu Bulunamadı" });
    
    const [name, pos, rat] = (user.password || "").split('|');
    res.json({
      id: user.id, name, position: pos, rating: rat,
      age: user.age, height: user.height, weight: user.weight, 
      foot: user.foot, team: user.team, league: user.league, country: user.country,
      isGlobal: user.isGlobal, // 🔥 Frontend bu değere bakarak sayı/ikon kararını verecek
      discoveredBy: user.discoveredBy,
      tags: user.tags || []
    });
  } catch (error) { res.status(500).send(); }
});

// 5. GÜNCELLEME (Edit-Player Sayfası İçin Gerekli)
app.put('/update-player/:id', async (req: Request, res: Response) => {
  const { name, position, rating, age, height, weight, foot, country, league, team, tags } = req.body;
  try {
    await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: {
        password: `${name}|${position}|${rating}`, // Rating'i güncelliyoruz
        age: age ? Number(age) : null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        foot: foot || null,
        country: country || null,
        league: league || null,
        team: team || null,
        tags: tags || []
      }
    });
    res.json({ message: "Güncellendi" });
  } catch (error) { res.status(400).json({ message: "Hata!" }); }
});

// 6. SİLME
app.delete('/delete-player/:id', async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Silindi" });
  } catch (error) { res.status(400).send(); }
});

// 7. LİDERLİK TABLOSU
app.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const scouts = await prisma.user.findMany({
      where: { NOT: { email: { startsWith: 'player_' } }, isGlobal: false },
      orderBy: { scoutScore: 'desc' }, take: 10
    });
    res.json(scouts.map(s => ({ id: s.id, name: s.email.split('@')[0], score: s.scoutScore, count: s.reportsCount })));
  } catch (error) { res.status(500).send(); }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚽ ScoutIQ Backend Aktif! (IP: 192.168.1.181) \n🌐 Port: ${PORT}`);
});

export default app;