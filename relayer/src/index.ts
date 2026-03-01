import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { withdrawRouter } from './routes/withdraw';
import { statusRouter } from './routes/status';
import { feesRouter } from './routes/fees';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/withdraw', withdrawRouter);
app.use('/status', statusRouter);
app.use('/fees', feesRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  logger.info(`SolMixer relayer running on port ${PORT}`);
});

export default app;
