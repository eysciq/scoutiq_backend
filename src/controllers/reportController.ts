// src/controllers/reportController.ts
import { Request, Response } from 'express';
import prisma from '../config/db';
import { PredictionService } from '../services/predictionService';

export class ReportController {
  static async saveReport(req: Request, res: Response): Promise<void> {
    try {
      // 1. Mobilden (Videodaki formdan) gelen verileri yakala
      const { playerName, country, league, team, position, rating, age, userId } = req.body;

      console.log(`📩 Yeni Rapor Geldi: ${playerName} - ${team}`);

      // 2. JWT (Kimlik Doğrulama) tam eklenene kadar sistemi test etmek için sahte bir kullanıcı garantileyelim
      const activeUserId = userId || "test-scout-id-123"; 
      let user = await prisma.user.findUnique({ where: { id: activeUserId } });
      if (!user) {
        user = await prisma.user.create({ 
          data: { id: activeUserId, email: "scout@scoutiq.com", name: "Kıdemli Scout", password: "hash" } 
        });
      }

      // 3. Oyuncu veritabanında var mı? Yoksa oluştur.
      // (İleride burası API-Football'dan gelen ID ile çalışacak, şimdilik form verisiyle mockluyoruz)
      let player = await prisma.player.findFirst({
        where: { name: playerName, team: team }
      });

      if (!player) {
        player = await prisma.player.create({
          data: {
            externalId: Math.floor(Math.random() * 1000000), // Geçici rastgele ID
            name: playerName,
            position: position || "Bilinmiyor",
            team: team || "Serbest"
          }
        });
      }

      // 4. Zeka Modülünü (Service) Çağır! Rozet ve kısıtlamaları o halledecek.
      const result = await PredictionService.createPrediction(user.id, player.id);

      // 5. Mobile başarıyla dön! (O kırmızı hata mesajı yerine yeşil tık çıkacak)
      res.status(201).json({
        message: "Yetenek raporu sisteme işlendi!",
        details: result
      });

    } catch (error: any) {
      console.error("❌ Kayıt Hatası:", error);
      
      // Eğer aynı scout, aynı oyuncuyu 2. kez eklemeye çalışırsa (Unique Constraint)
      if (error.code === 'P2002') {
        res.status(409).json({ error: "Bu oyuncuyu zaten portföyüne ekledin!" });
        return;
      }

      res.status(500).json({ error: "Sunucu hatası, kaydedilemedi." });
    }
  }
}
