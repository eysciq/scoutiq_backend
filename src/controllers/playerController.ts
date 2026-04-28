import { Request, Response } from 'express';
import prisma from '../config/db'; // Singleton prisma instance'ını kullanıyoruz

// 🚀 OYUNCU TAHMİN ETME (SCOUTING) MANTIĞI
export const scoutPlayer = async (req: Request, res: Response) => {
    try {
        const { userId, playerId, currentMarketValue } = req.body;

        // 1. Kullanıcıyı ve Haftalık Hakkını Kontrol Et
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı." });

        // 2. Eğer haftalık hak bittiyse Not Defterine yönlendir
        if (user.weeklyPredictionsLeft <= 0) {
            return res.status(403).json({ 
                error: "Haftalık tahmin hakkın doldu!", 
                suggestedAction: "Notebook",
                message: "Bu oyuncuyu unutmamak için not defterine kaydedebilirsin." 
            });
        }

        // 3. Bu oyuncu daha önce bu kullanıcı tarafından tahmin edildi mi?
        const existingPrediction = await prisma.prediction.findUnique({
            where: { userId_playerId: { userId, playerId } }
        });
        if (existingPrediction) return res.status(400).json({ error: "Bu oyuncuyu zaten tahmin ettin!" });

        // 4. 🔥 KEŞİF SIRASINI HESAPLA (Discovery Order)
        const previousPredictionsCount = await prisma.prediction.count({
            where: { playerId: playerId }
        });
        const order = previousPredictionsCount + 1;

        // 5. 🏆 ÇARPAN BELİRLE (Senin istediğin kademeli yapı)
        let multiplier = 1.0;
        if (order === 1) multiplier = 5.0;      // The Visionary
        else if (order === 2) multiplier = 3.0; // The First Eye
        else if (order === 3) multiplier = 2.0; // The Watcher
        else if (order <= 10) multiplier = 1.5;
        else if (order <= 50) multiplier = 1.2;
        else if (order <= 100) multiplier = 1.1;

        // 6. TAHMİNİ KAYDET
        const prediction = await prisma.prediction.create({
            data: {
                userId,
                playerId,
                initialValue: currentMarketValue || 0,
                discoveryOrder: order,
                multiplier: multiplier,
                isVisible: false // Tahminler gizli kalacak demiştik
            }
        });

        // 7. KULLANICI VERİLERİNİ GÜNCELLE (Hakkı 1 azalt)
        await prisma.user.update({
            where: { id: userId },
            data: { 
                weeklyPredictionsLeft: { decrement: 1 },
                totalXP: { increment: 50 } // Her tahmin için küçük bir XP
            }
        });

        res.status(201).json({
            message: `Başarıyla tahmin edildi! Dünyadaki ${order}. scoutsun.`,
            multiplier: multiplier,
            prediction
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Tahmin kaydedilemedi." });
    }
};

// 📓 NOT DEFTERİNE KAYDETME (Hakkı bitenler için)
export const saveToNotebook = async (req: Request, res: Response) => {
    try {
        const { userId, playerId, note } = req.body;
        const entry = await prisma.notebook.create({
            data: { userId, playerId, note }
        });
        res.status(201).json({ message: "Not defterine kaydedildi.", entry });
    } catch (e) {
        res.status(500).json({ error: "Not kaydedilemedi." });
    }
};

// 🌍 GENEL OYUNCU LİSTESİ VE DETAYLAR
export const getGlobalPlayers = async (req: Request, res: Response) => {
    try {
        const players = await prisma.player.findMany({
            include: { _count: { select: { predictions: true } } } // Kaç kişi tahmin etmiş görsün
        });
        res.json(players);
    } catch (e) {
        res.status(500).json({ error: "Oyuncular getirilemedi." });
    }
};

export const getPlayerDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const player = await prisma.player.findUnique({ 
            where: { id },
            include: { predictions: { take: 5, orderBy: { predictedAt: 'asc' } } } // İlk 5 scout'u merak edenler için
        });
        res.json(player);
    } catch (e) {
        res.status(500).json({ error: "Detaylar getirilemedi." });
    }
};

// Diğer boş fonksiyonları senin yapıya göre tutuyorum
export const getPlayers = (req: Request, res: Response) => { res.json([]); };
export const updatePlayer = (req: Request, res: Response) => { res.json({}); };
export const deletePlayer = (req: Request, res: Response) => { res.json({}); };