import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Solmixer } from '../target/types/solmixer';
import { assert } from 'chai';
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';

describe('solmixer', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Solmixer as Program<Solmixer>;

  const authority = provider.wallet;
  const denomination = new anchor.BN(LAMPORTS_PER_SOL); // 1 SOL

  let mixerPoolPda: PublicKey;

  before(async () => {
    [mixerPoolPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('mixer_pool'),
        authority.publicKey.toBuffer(),
        denomination.toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );
  });

  it('initializes the mixer pool', async () => {
    await program.methods
      .initializePool(denomination, 20)
      .accounts({
        mixerPool: mixerPoolPda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const pool = await program.account.mixerPool.fetch(mixerPoolPda);
    assert.equal(pool.denomination.toNumber(), LAMPORTS_PER_SOL);
    assert.equal(pool.treeSize, 0);
    assert.equal(pool.merkleRoot.every((b: number) => b === 0), true);
  });

  it('accepts a deposit', async () => {
    const commitment = new Array(32).fill(0);
    commitment[0] = 1; // Non-zero commitment
    const commitmentArray = new Uint8Array(commitment);

    const depositor = Keypair.generate();
    await provider.connection.requestAirdrop(depositor.publicKey, 2 * LAMPORTS_PER_SOL);
    await new Promise((r) => setTimeout(r, 1000));

    await program.methods
      .deposit([...commitmentArray])
      .accounts({
        mixerPool: mixerPoolPda,
        depositor: depositor.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([depositor])
      .rpc();

    const pool = await program.account.mixerPool.fetch(mixerPoolPda);
    assert.equal(pool.treeSize, 1);
  });

  it('rejects deposit with zero commitment', async () => {
    const zeroCommitment = new Array(32).fill(0);
    const depositor = Keypair.generate();
    await provider.connection.requestAirdrop(depositor.publicKey, 2 * LAMPORTS_PER_SOL);
    await new Promise((r) => setTimeout(r, 1000));

    try {
      await program.methods
        .deposit([...zeroCommitment])
        .accounts({
          mixerPool: mixerPoolPda,
          depositor: depositor.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([depositor])
        .rpc();
      assert.fail('Should have thrown');
    } catch (err: any) {
      assert.include(err.toString(), 'InvalidCommitment');
    }
  });
});
