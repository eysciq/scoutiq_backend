// Dosya Yolu: src/controllers/auth.controllers.ts

import { Request, Response } from 'express';
import prisma from '../config/db';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Email kullanımda mı kontrolü
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Bu email adresi zaten kullanılıyor." });
      return;
    }

    // Yeni kullanıcıyı oluştur
    // Not: schema.prisma'da tanımladığımız default değerler burada devreye giriyor (Level 1, 2 Tahmin Hakkı vb.)
    const newUser = await prisma.user.create({
      data: {
        email,
        password, // Not: Gerçek projede burası kesinlikle bcrypt ile şifrelenmeli!
        name,
        weeklyPredictionsLeft: 2, // Yeni başlayan scout'a 2 hak tanımlıyoruz
        totalXP: 0,
        scoutLevel: 1
      }
    });

    res.status(201).json({
      message: "ScoutIQ dünyasına hoş geldin!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        scoutLevel: newUser.scoutLevel,
        totalXP: newUser.totalXP,
        weeklyPredictionsLeft: newUser.weeklyPredictionsLeft,
        totalScoutScore: newUser.totalScoutScore
      }
    });
  } catch (error: any) {
    console.error("❌ Kayıt Hatası:", error);
    res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.password !== password) {
      res.status(401).json({ error: "Hatalı email veya şifre." });
      return;
    }

    // 🔥 KRİTİK: Haftalık hakların resetlenme zamanı geldi mi kontrolü burada yapılabilir 
    // (Şimdilik manuel tutuyoruz ama altyapı hazır)

    res.status(200).json({
      message: "Giriş başarılı! Sahaya dönmeye hazır mısın?",
      token: "gecici-jwt-token-123", 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        scoutLevel: user.scoutLevel,
        totalXP: user.totalXP,
        weeklyPredictionsLeft: user.weeklyPredictionsLeft,
        totalScoutScore: user.totalScoutScore,
        successfulPredictions: user.successfulPredictions
      }
    });
  } catch (error: any) {
    console.error("❌ Giriş Hatası:", error);
    res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
};