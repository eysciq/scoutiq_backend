import { Router } from 'express';
import { 
    createPlayer, 
    getGlobalPlayers, 
    getPlayers, 
    getPlayerDetails, 
    updatePlayer, 
    deletePlayer, 
    getMyProfile, 
    getLeaderboard 
} from '../controllers/playerController';

const router = Router();

router.post('/players', createPlayer);
router.get('/global-players', getGlobalPlayers);
router.get('/players', getPlayers);
router.get('/player-details/:id', getPlayerDetails);
router.put('/update-player/:id', updatePlayer);
router.delete('/delete-player/:id', deletePlayer);
router.get('/my-profile', getMyProfile);
router.get('/leaderboard', getLeaderboard);

export default router;