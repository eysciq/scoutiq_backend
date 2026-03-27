import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router: Router = Router();

/**
 * 🔐 KİMLİK DOĞRULAMA ROTALARI
 * /api/auth/register -> Yeni Scout kaydı
 * /api/auth/login    -> Mevcut Scout girişi
 */

// 📝 Kayıt Ol: Yeni bir kullanıcı (Scout) oluşturur
router.post('/register', register);

// 🔑 Giriş Yap: Mevcut kullanıcı bilgilerini doğrular ve yetki verir
router.post('/login', login);

export default router;