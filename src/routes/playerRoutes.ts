import { Router } from 'express';
import { 
  addPlayer, 
  getPlayers, 
  getGlobalPlayers, 
  getPlayerDetails, 
  updatePlayer, 
  deletePlayer, 
  getMyProfile, 
  getLeaderboard, 
  syncPlayers 
} from '../controllers/playerController';

const router: Router = Router();

// ➕ Yeni Oyuncu Raporu Ekle
router.post('/add-player', addPlayer);

// 📋 Kendi Portföyüm
router.get('/players', getPlayers);

// 🌍 Keşfet / Radar (İsmi düzelttik)
router.get('/global-players', getGlobalPlayers); 

// 🔍 Tekil Oyuncu Detayları
router.get('/player-details/:id', getPlayerDetails);

// 🔄 Rapor Güncelleme
router.put('/update-player/:id', updatePlayer);

// 🗑️ Rapor Silme
router.delete('/delete-player/:id', deletePlayer);

/**
 * 🏆 SCOUT İSTATİSTİKLERİ
 */
router.get('/my-profile', getMyProfile);
router.get('/leaderboard', getLeaderboard);
router.get('/sync-api', syncPlayers);

export default router;