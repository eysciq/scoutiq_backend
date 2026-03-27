// Dosya Yolu: src/controllers/authController.ts
import { Request, Response } from 'express';
import prisma from '../config/db'; // Az önce kurduğumuz kileri (veritabanını) çağırıyoruz

// 1. KAYIT OLMA İŞLEMİ (Aşçı 1)
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await prisma.user.findFirst({ where: { email: cleanEmail } });
    
    if (existing) {
      return res.status(400).json({ error: "Bu e-posta zaten kullanılıyor!" });
    }
    
    await prisma.user.create({
      data: { name, email: cleanEmail, password, isGlobal: false, discoveredBy: 'SCOUT_ACCOUNT' }
    });
    
    res.status(200).json({ message: "Kayıt başarılı" });
  } catch (error) {
    res.status(500).json({ error: "Kayıt hatası." });
  }
};

// 2. GİRİŞ YAPMA İŞLEMİ (Aşçı 2)
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const cleanEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findFirst({ where: { email: cleanEmail, password } });
    
    if (user) {
      res.status(200).json({ message: "Giriş başarılı", name: user.name, email: user.email });
    } else {
      res.status(401).json({ error: "Hatalı giriş!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Giriş hatası." });
  }
};