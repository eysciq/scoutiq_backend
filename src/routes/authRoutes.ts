import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router: Router = Router();

/**
 * 🔐 KİMLİK DOĞRULAMA ROTALARI
 * app.ts içinde '/auth' altına bağlandığı için adresler şöyledir:
 * POST -> /auth/register
 * POST -> /auth/login
 */

// 📝 Kayıt Ol: Yeni bir kullanıcı (Scout) oluşturur
router.post('/register', register);

// 🔑 Giriş Yap: Mevcut kullanıcı bilgilerini doğrular ve yetki verir
router.post('/login', login);

// 🚨 KRİTİK: app.ts'in bu dosyayı görebilmesi için:
export default router;