// Dosya Yolu: src/controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 1. KAYIT OLMA İŞLEMİ (Şifreleme ve Skor eklendi)
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const cleanEmail = String(email).trim().toLowerCase();
    
    // Şifreyi bcrypt ile güvenli hale getiriyoruz
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await prisma.user.create({ 
      data: { 
        email: cleanEmail, 
        password: hashedPassword, 
        scoutScore: 0, 
        reportsCount: 0 
      } 
    });
    
    res.status(200).json({ message: "Kayıt başarılı" });
  } catch (error) { 
    res.status(400).json({ message: "E-posta kullanımda!" }); 
  }
};

// 2. GİRİŞ YAPMA İŞLEMİ
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const cleanEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    
    // Şifre çözme ve doğrulama
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Hatalı!" });
    }
    
    res.status(200).json({ message: "Başarılı", scoutScore: user.scoutScore, email: user.email });
  } catch (error) { 
    res.status(500).send(); 
  }
};