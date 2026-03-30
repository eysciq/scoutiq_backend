// src/routes/playerRoutes.ts
import { Router } from 'express';
import * as playerController from '../controllers/playerController';

const router = Router();

// İstek gelip gelmediğini terminalde görmek için bir ajan (middleware) koyuyoruz
router.use((req, res, next) => {
  console.log(`📡 Mobil Uygulamadan İstek Geldi: ${req.method} ${req.originalUrl}`);
  next();
});

// 🌍 Keşfet (Global Radar) Ekranı
router.get('/global-players', playerController.getGlobalPlayers);

// 📋 Portföyüm Ekranı
router.get('/players', playerController.getPlayers);

// 🔍 Detay Ekranı
router.get('/player-details/:id', playerController.getPlayerDetails);

// Diğer eski rotalar (Uygulama çökmesin diye boş dönüyorlar)
router.put('/update-player/:id', playerController.updatePlayer);
router.delete('/delete-player/:id', playerController.deletePlayer);
router.get('/my-profile', playerController.getMyProfile);
router.get('/leaderboard', playerController.getLeaderboard);

export default router;