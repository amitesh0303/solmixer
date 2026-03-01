import { RelayerService, Proof } from '../services/relayer';

describe('RelayerService', () => {
  let relayerService: RelayerService;

  beforeEach(() => {
    relayerService = new RelayerService('https://api.devnet.solana.com');
  });

  describe('verifyProof', () => {
    it('should return false for invalid proof structure', async () => {
      const invalidProof = {} as Proof;
      const result = await relayerService.verifyProof(invalidProof, []);
      expect(result).toBe(false);
    });

    it('should return false for proof with wrong array lengths', async () => {
      const invalidProof: Proof = {
        pi_a: ['1', '2'],
        pi_b: [['1', '2'], ['3', '4']],
        pi_c: ['1', '2'],
        protocol: 'groth16',
        curve: 'bn128',
      };
      const result = await relayerService.verifyProof(invalidProof, ['signal1', 'signal2']);
      expect(result).toBe(false);
    });

    it('should return true for valid proof structure', async () => {
      const validProof: Proof = {
        pi_a: ['1', '2', '1'],
        pi_b: [['1', '2'], ['3', '4'], ['1', '0']],
        pi_c: ['1', '2', '1'],
        protocol: 'groth16',
        curve: 'bn128',
      };
      const result = await relayerService.verifyProof(validProof, ['nullifierHash', 'root', 'recipient', 'relayer', 'fee', 'refund']);
      expect(result).toBe(true);
    });
  });

  describe('calculateFee', () => {
    it('should calculate 0.1% fee correctly', () => {
      const denomination = BigInt(1_000_000_000); // 1 SOL in lamports
      const fee = relayerService.calculateFee(denomination);
      expect(fee).toBe(BigInt(1_000_000)); // 0.001 SOL
    });
  });

  describe('getFees', () => {
    it('should return fee structure', () => {
      const fees = relayerService.getFees();
      expect(fees.relayFeePercent).toBe(0.1);
      expect(fees.relayFeeBasisPoints).toBe(10);
      expect(fees.currency).toBe('SOL');
    });
  });
});
