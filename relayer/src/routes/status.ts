import { Router, Request, Response } from 'express';
import { RelayerService } from '../services/relayer';
import { logger } from '../utils/logger';

export const statusRouter = Router();
const relayerService = new RelayerService();

statusRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const status = await relayerService.getWithdrawalStatus(id);

    if (!status) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    return res.json(status);
  } catch (error: any) {
    logger.error('Status check error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});
