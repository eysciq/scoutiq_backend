import { Request, Response } from 'express';
import prisma from '../config/db'; // 🛠️ Hata buradaydı, yeni yolu gösterdik!

// 📋 PORTFÖYÜM (Artık direkt oyuncuyu değil, kullanıcının 'Tahminlerini' getiriyoruz)
export const getPlayers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    if (!userId) {
      res.json([]);
      return;
    }

    // Yeni şemada portföy, kullanıcının yaptığı 'Prediction'lar (Tahminler) üzerinden gelir
    const predictions = await prisma.prediction.findMany({
      where: { userId: String(userId) },
      include: { player: true },
      orderBy: { predictedAt: 'desc' }
    });
    
    // Mobil uygulamanın çökmemesi için verileri paketleyip yolluyoruz
    const formattedPlayers = predictions.map(p => ({
      id: p.player.id,
      name: p.player.name,
      position: p.player.position,
      team: p.player.team,
      pointsEarned: p.pointsEarned,
      hasBadge: p.hasScoutBadge, // Rozeti var mı mobilde gösterebilirsin
      predictedAt: p.predictedAt
    }));

    res.json(formattedPlayers);
  } catch (error) {
    res.json([]);
  }
};

// 🌍 GLOBAL RADAR
export const getGlobalPlayers = async (req: Request, res: Response): Promise<void> => {
  try {
    const players = await prisma.player.findMany({ take: 50 });
    res.json(players);
  } catch (error) {
    res.json([]);
  }
};

// 🔍 OYUNCU DETAYLARI
export const getPlayerDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const player = await prisma.player.findUnique({
      where: { id: String(req.params.id) }
    });
    if (!player) {
      res.status(404).json({ error: "Oyuncu bulunamadı" });
      return;
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

// ==========================================
// Ekleme işlemlerini ReportController'a (Beyin takımına) devrettiğimiz için 
// eski fonksiyonların içini uygulama patlamasın diye güvenli hale getirdik.
// ==========================================
export const addPlayer = async (req: Request, res: Response) => res.json({ message: "Lütfen /api/reports/add rotasını kullanın." });
export const updatePlayer = async (req: Request, res: Response) => res.json({ ok: true });
export const deletePlayer = async (req: Request, res: Response) => res.json({ ok: true });
export const getMyProfile = async (req: Request, res: Response) => res.json({ ok: true });
export const getLeaderboard = async (req: Request, res: Response) => res.json([]);
export const syncPlayers = async (req: Request, res: Response) => res.json({ ok: true });