import app from './app';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const PORT = 3001;
const IP_ADRESI = '192.168.1.181'; 

// =================================================================
// 🌍 FUTBOL VERİ HAVUZU
// =================================================================
const footballData = [
  {
    country: "Türkiye",
    leagues: [
      { name: "Trendyol Süper Lig", teams: ["Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor", "Eyüpspor", "Samsunspor", "Göztepe", "Başakşehir", "Kasımpaşa", "Antalyaspor"] },
      { name: "Trendyol 1. Lig", teams: ["Kocaelispor", "Bandırmaspor", "Erzurumspor", "Iğdır FK", "Gençlerbirliği"] }
    ]
  },
  {
    country: "İngiltere",
    leagues: [
      { name: "Premier League", teams: ["Man City", "Liverpool", "Arsenal", "Chelsea", "Man United", "Tottenham"] },
      { name: "Championship", teams: ["Burnley", "Leeds", "Sheffield Utd", "Hull City"] }
    ]
  }
];

app.get('/countries', (req: any, res: any) => res.json(footballData.map(d => d.country)));
app.get('/leagues', (req: any, res: any) => {
  const country = req.query.country as string;
  const data = footballData.find(d => d.country === country);
  res.json(data ? data.leagues.map(l => l.name) : []);
});
app.get('/teams', (req: any, res: any) => {
  const country = req.query.country as string;
  const league = req.query.league as string;
  const cData = footballData.find(d => d.country === country);
  const lData = cData?.leagues.find(l => l.name === league);
  res.json(lData ? lData.teams : []);
});

// =================================================================
// 🔐 GİRİŞ VE KAYIT SİSTEMİ 
// =================================================================
app.post('/register', async (req: any, res: any) => {
  const { name, email, password } = req.body;
  try {
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) return res.status(400).json({ error: "Bu e-posta zaten kullanılıyor!" });
    
    await prisma.user.create({
      data: { name, email, password, isGlobal: false, discoveredBy: 'SCOUT_ACCOUNT' }
    });
    res.status(200).json({ message: "Kayıt başarılı" });
  } catch (error) {
    res.status(500).json({ error: "Kayıt hatası." });
  }
});

app.post('/login', async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findFirst({ where: { email, password } });
    if (user) res.status(200).json({ message: "Giriş başarılı", name: user.name });
    else res.status(401).json({ error: "Hatalı giriş!" });
  } catch (error) {
    res.status(500).json({ error: "Giriş hatası." });
  }
});

// =================================================================
// ✍️ OYUNCU İŞLEMLERİ
// =================================================================

// 📋 1. PORTFÖYÜM (Sadece Scout'un Eklediği ve Reyting Verdiği Oyuncular)
app.get('/players', async (req: any, res: any) => {
  const { scoutEmail, search, position } = req.query;
  if (!scoutEmail) return res.json([]); 
  
  try {
    const players = await prisma.user.findMany({
      where: { 
        discoveredBy: String(scoutEmail).toLowerCase().trim(), 
        isGlobal: false,
        password: search ? { contains: String(search), mode: 'insensitive' } : undefined,
      },
      orderBy: { id: 'desc' }
    });

    const formatted = players.map(p => {
      const [name, pos, rat, team, league, country] = (p.password || "").split('|');
      return { 
        id: p.id, name, position: pos, rating: rat, team: team || 'Serbest', 
        league, country, age: p.age, foot: p.foot, scoutEmail: p.discoveredBy,
        tags: p.tags ? p.tags.split(',').filter(t => t !== "") : []
      };
    });

    let filtered = formatted;
    if (position && position !== 'Hepsi') {
      filtered = filtered.filter(p => p.position === position);
    }
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Portföy çekilemedi." });
  }
});

// 🌍 2. KEŞFET (GLOBAL HAVUZ) - 🔥 REYTİNG TAMAMEN KALDIRILDI
app.get('/global-players', async (req: any, res: any) => {
  const { search, position } = req.query;
  try {
    const players = await prisma.user.findMany({
      where: { 
        isGlobal: true,
        password: search ? { contains: String(search), mode: 'insensitive' } : undefined
      },
      orderBy: { id: 'desc' }
    });

    const formatted = players.map(p => {
      const [name, pos, rat, team, league, country] = (p.password || "").split('|');
      
      let translatedPos = pos || 'Orta Saha';
      if (translatedPos.includes('Attacker')) translatedPos = 'Forvet';
      if (translatedPos.includes('Midfielder')) translatedPos = 'Orta Saha';
      if (translatedPos.includes('Defender')) translatedPos = 'Defans';
      if (translatedPos.includes('Goalkeeper')) translatedPos = 'Kaleci';

      return { 
        id: p.id, 
        name, 
        position: translatedPos, 
        rating: null, // 🔥 GLOBAL OYUNCULARIN REYTİNGİ YOKTUR!
        team: team || 'Dünya Yıldızı', 
        league, 
        country,
        age: p.age || 20,          
        foot: p.foot || "Sağ",     
        isGlobal: true,
        tags: p.tags ? p.tags.split(',').filter(t => t !== "") : []
      };
    });

    let filtered = formatted;
    if (position && position !== 'Hepsi') {
      filtered = filtered.filter(p => p.position === position);
    }
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Global liste çekilemedi." });
  }
});

// 🔄 3. GERÇEK OYUNCU SENKRONİZASYONU - 🔥 SAHTE REYTİNG ÜRETİMİ SİLİNDİ
app.get('/sync-players', async (req: any, res: any) => {
  const API_SPORTS_KEY = '8275eb6b5441f41afc96e642463126aa'; 

  try {
    const response = await axios.get('https://v3.football.api-sports.io/players', {
      params: { league: '39', season: '2023', page: '1' }, 
      headers: { 'x-apisports-key': API_SPORTS_KEY }
    });

    const apiPlayers = response.data.response;
    if (!apiPlayers || apiPlayers.length === 0) return res.status(404).json({ message: "Oyuncu verisi gelmedi." });

    let eklendi = 0;
    for (const item of apiPlayers) {
      const p = item.player;
      const s = item.statistics[0]; 

      if (p && s) {
        await prisma.user.upsert({
          where: { email: `api_${p.id}@scoutiq.com` },
          update: {}, 
          create: {
            name: p.name,
            email: `api_${p.id}@scoutiq.com`,
            // 🔥 Reyting kısmını boş bıraktık (|| yan yana)
            password: `${p.name}|${s.games?.position || 'Orta Saha'}||${s.team?.name || 'Bilinmiyor'}|${s.league?.name || 'Premier League'}|${p.nationality}`,
            age: p.age || 20,
            foot: "Sağ",
            isGlobal: true, 
            discoveredBy: 'API_FOOTBALL'
          }
        });
        eklendi++;
      }
    }
    res.json({ message: `${eklendi} gerçek yıldız sisteme aktarıldı!` });
  } catch (error) {
    res.status(500).json({ error: "Veri çekme başarısız." });
  }
});

app.post('/add-player', async (req: any, res: any) => {
  const { name, position, rating, team, league, country, age, foot, scoutEmail, tags } = req.body;
  try {
    const player = await prisma.user.create({
      data: {
        email: `p_${Date.now()}@scoutiq.com`,
        password: `${name}|${position}|${rating}|${team || ''}|${league || ''}|${country || ''}`,
        age: Number(age) || null,
        foot: foot || "Sağ",
        isGlobal: false,
        discoveredBy: scoutEmail ? scoutEmail.toLowerCase().trim() : 'Sistem',
        tags: (tags && Array.isArray(tags)) ? tags.join(',') : null 
      }
    });
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: "Kayıt hatası." });
  }
});

app.put('/update-player/:id', async (req: any, res: any) => {
  const { name, position, rating, team, league, country, age, foot, tags } = req.body;
  try {
    const tagsString = (tags && Array.isArray(tags)) ? tags.filter(t => t !== "").join(',') : null;
    await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: {
        password: `${name}|${position}|${rating}|${team || ''}|${league || ''}|${country || ''}`,
        age: Number(age) || null,
        foot: foot || "Sağ",
        tags: tagsString
      }
    });
    res.json({ message: "Başarıyla güncellendi" });
  } catch (error) {
    res.status(500).json({ message: "Güncelleme hatası." });
  }
});

app.get('/player-details/:id', async (req: any, res: any) => {
  try {
    const p = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
    if (!p) return res.status(404).json({ message: "Oyuncu bulunamadı" });
    const [name, pos, rat, team, league, country] = (p.password || "").split('|');
    res.json({ 
      id: p.id, name, position: pos, rating: rat, team, league, country, 
      age: p.age, foot: p.foot, isGlobal: p.isGlobal,
      tags: p.tags ? p.tags.split(',').filter(t => t !== "") : [] 
    });
  } catch (error) {
    res.status(500).json({ message: "Detay hatası." });
  }
});

app.delete('/delete-player/:id', async (req: any, res: any) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Silinemedi." });
  }
});

app.get('/my-profile', async (req: any, res: any) => {
  const email = req.query.email ? String(req.query.email).toLowerCase().trim() : '';
  const count = await prisma.user.count({ where: { discoveredBy: email, isGlobal: false } });
  res.json({ score: count * 10, count });
});

app.get('/leaderboard', async (req: any, res: any) => {
  const scouts = await prisma.user.groupBy({
    by: ['discoveredBy'],
    _count: { id: true },
    where: { NOT: { discoveredBy: 'Sistem' }, isGlobal: false }
  });
  
  const formatted = scouts.map(s => ({
    name: s.discoveredBy || "Anonim",
    score: s._count.id * 10,
    count: s._count.id,
    id: s.discoveredBy
  })).sort((a, b) => b.score - a.score);
  res.json(formatted);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚽ ScoutIQ Backend: Aktif! 🚀`);
  console.log(`📡 Sunucu IP: ${IP_ADRESI} | Port: ${PORT}`);
});