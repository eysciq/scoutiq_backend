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

    // Yeni kullanıcıyı oluştur (totalScoutScore ve successfulPredictions Prisma şemasında @default(0) olduğu için burada yazmamıza gerek yok, otomatik 0 atanır)
    const newUser = await prisma.user.create({
      data: {
        email,
        password, // İleride buraya bcrypt ekleyeceğiz, şimdilik düz tutuyoruz
        name
      }
    });

    res.status(201).json({
      message: "Kayıt başarılı!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        totalScoutScore: newUser.totalScoutScore,
        successfulPredictions: newUser.successfulPredictions
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

    // Başarılı girişte dönecek veriler
    res.status(200).json({
      message: "Giriş başarılı!",
      token: "gecici-jwt-token-123", // İleride burayı gerçek JWT yapacağız
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        totalScoutScore: user.totalScoutScore, // <-- Hata veren yer burasıydı, düzelttik
        successfulPredictions: user.successfulPredictions
      }
    });
  } catch (error: any) {
    console.error("❌ Giriş Hatası:", error);
    res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
};