import { Router, Request, Response } from 'express';
import { RelayerService } from '../services/relayer';

export const feesRouter = Router();
const relayerService = new RelayerService();

feesRouter.get('/', (_req: Request, res: Response) => {
  const fees = relayerService.getFees();
  return res.json(fees);
});
