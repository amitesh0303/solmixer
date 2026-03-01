import { Router, Request, Response } from 'express';
import { RelayerService, WithdrawalRequest } from '../services/relayer';
import { logger } from '../utils/logger';

export const withdrawRouter = Router();
const relayerService = new RelayerService();

withdrawRouter.post('/', async (req: Request, res: Response) => {
  try {
    const withdrawalRequest: WithdrawalRequest = req.body;

    // Validate request
    if (!withdrawalRequest.proof || !withdrawalRequest.recipient || !withdrawalRequest.nullifierHash) {
      return res.status(400).json({
        error: 'Missing required fields: proof, recipient, nullifierHash',
      });
    }

    const txSignature = await relayerService.submitWithdrawal(withdrawalRequest);

    return res.json({
      success: true,
      txSignature,
      message: 'Withdrawal submitted successfully',
    });
  } catch (error: any) {
    logger.error('Withdrawal error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});
