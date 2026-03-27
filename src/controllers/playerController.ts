import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 📋 1. OYUNCU EKLEME (Benzersiz Email ve Hata Yakalama Eklendi)
export const addPlayer = async (req: Request, res: Response): Promise<void> => {
  const { name, position, rating, age, height, weight, foot, scoutEmail, country, league, team, tags } = req.body;
  try {
    const cleanScoutEmail = scoutEmail ? String(scoutEmail).trim().toLowerCase() : null;
    
    // 🔥 KRİTİK DÜZELTME: Email çakışmasını önlemek için random ID ekledik
    const uniqueEmail = `player_${Date.now()}_${Math.floor(Math.random() * 10000)}@scoutiq.com`;
    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || "");

    await prisma.user.create({
      data: {
        email: uniqueEmail,
        password: `${name}|${position}|${rating}`,
        discoveredBy: cleanScoutEmail,
        age: age ? Number(age) : null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        foot: foot || "Sağ",
        isGlobal: false,
        country: country || null,
        league: league || null,
        team: team || null,
        tags: tagsStr
      },
    });

    // 🏆 Scout Puan Güncelleme
    if (cleanScoutEmail && cleanScoutEmail !== "misafir@scoutiq.com") {
      try {
        await prisma.user.update({
          where: { email: cleanScoutEmail },
          data: { scoutScore: { increment: 10 }, reportsCount: { increment: 1 } }
        });
      } catch (updateErr) {
        console.log("⚠️ Scout puanı güncellenemedi (Kullanıcı bulunamadı)");
      }
    }
    
    res.json({ message: "Başarılı" });
  } catch (error: any) {
    console.error("❌ Ekleme Hatası:", error);
    res.status(400).json({ message: "Sunucu kaydı reddetti", error: error.message });
  }
};

// 📋 2. PORTFÖYÜM
export const getPlayers = async (req: Request, res: Response): Promise<void> => {
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
    
    const formatted = players.map(u => {
      const [name, pos, rat] = (u.password || "").split('|');
      return { id: u.id, name, position: pos, rating: rat, team: u.team, league: u.league, country: u.country, isGlobal: false };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).send();
  }
};

// 🌍 3. KEŞFET / RADAR
export const getGlobalPlayers = async (req: Request, res: Response): Promise<void> => {
  const { search, position, minAge, maxAge } = req.query;
  const min = minAge ? Number(minAge) : 0;
  const max = maxAge ? Number(maxAge) : 99;

  try {
    const players = await prisma.user.findMany({
      where: { 
        isGlobal: true,
        age: { gte: min, lte: max }, 
        password: {
          contains: (position && position !== 'Hepsi') ? String(position) : (search ? String(search) : ""),
          mode: 'insensitive'
        }
      },
      orderBy: { id: 'desc' },
      take: 50
    });
    
    const formatted = players.map(u => {
      const [name, pos, rat] = (u.password || "").split('|');
      return { id: u.id, name, position: pos, rating: rat, team: u.team || "Global Star", age: u.age, country: u.country, league: u.league, isGlobal: true };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Radar Hatası" });
  }
};

// 📋 4. OYUNCU DETAYI
export const getPlayerDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
    if (!user) return res.status(404).json({ message: "Yok" });
    
    const [name, pos, rat] = (user.password || "").split('|');
    const safeTags = typeof user.tags === 'string' ? user.tags.split(',').filter(t => t !== "") : (user.tags || []);
    
    res.json({ id: user.id, name, position: pos, rating: rat, age: user.age, height: user.height, weight: user.weight, foot: user.foot, team: user.team, league: user.league, country: user.country, isGlobal: user.isGlobal, tags: safeTags });
  } catch (error) {
    res.status(500).send();
  }
};

// 📋 5. GÜNCELLEME
export const updatePlayer = async (req: Request, res: Response): Promise<void> => {
  const { name, position, rating, age, height, weight, foot, country, league, team, tags } = req.body;
  try {
    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || "");
    await prisma.user.update({ 
      where: { id: Number(req.params.id) }, 
      data: { 
        password: `${name}|${position}|${rating}`, 
        age: age ? Number(age) : null, 
        height: height ? Number(height) : null, 
        weight: weight ? Number(weight) : null, 
        foot: foot || null, 
        country: country || null, 
        league: league || null, 
        team: team || null, 
        tags: tagsStr 
      } 
    });
    res.json({ message: "OK" });
  } catch (error) {
    res.status(400).send();
  }
};

// 📋 6. SİLME
export const deletePlayer = async (req: Request, res: Response): Promise<void> => {
  try { 
    await prisma.user.delete({ where: { id: Number(req.params.id) } }); 
    res.json({ message: "Silindi" }); 
  } catch (error) {
    res.status(400).send();
  }
};

// 🏆 7. LİDERLİK TABLOSU
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const scouts = await prisma.user.findMany({ 
      where: { NOT: { email: { startsWith: 'player_' } }, isGlobal: false }, 
      orderBy: { scoutScore: 'desc' }, 
      take: 10 
    });
    res.json(scouts.map(s => ({ id: s.id, name: s.email.split('@')[0], score: s.scoutScore, count: s.reportsCount })));
  } catch (error) {
    res.status(500).send();
  }
};

// 👤 8. PROFİLİM
export const getMyProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: String(req.query.email).trim().toLowerCase() } });
    if (user) res.json({ score: user.scoutScore, count: user.reportsCount });
    else res.status(404).send();
  } catch (error) {
    res.status(500).send();
  }
};

// 🔄 9. SYNC
export const syncPlayers = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: "Sync özelliği şu an pasif." });
};