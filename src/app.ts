import express from 'express';
import cors from 'cors';
import playerRoutes from './routes/playerRoutes';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// ŞİMDİLİK SADECE PLAYER ROUTES AKTİF
app.use('/api', playerRoutes);

app.get('/status', (req, res) => {
    res.json({ status: "ScoutIQ Online" });
});

export default app;