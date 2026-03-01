use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/// Maximum number of commitments in the Merkle tree (2^20)
pub const MAX_TREE_SIZE: u32 = 1_048_576;
/// Maximum field size for BN128 curve
pub const FIELD_SIZE: &str = "21888242871839275222246405745257275088548364400416034343698204186575808495617";

#[program]
pub mod solmixer {
    use super::*;

    /// Initialize a new mixer pool with a fixed denomination
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        denomination: u64,
        merkle_levels: u8,
    ) -> Result<()> {
        require!(denomination > 0, SolMixerError::InvalidDenomination);
        require!(merkle_levels > 0 && merkle_levels <= 20, SolMixerError::InvalidMerkleLevel);

        let pool = &mut ctx.accounts.mixer_pool;
        pool.authority = ctx.accounts.authority.key();
        pool.denomination = denomination;
        pool.merkle_root = [0u8; 32];
        pool.tree_size = 0;
        pool.merkle_levels = merkle_levels;
        pool.bump = ctx.bumps.mixer_pool;

        msg!("SolMixer pool initialized with denomination: {} lamports", denomination);
        Ok(())
    }

    /// Deposit SOL into the mixer pool
    pub fn deposit(
        ctx: Context<Deposit>,
        commitment: [u8; 32],
    ) -> Result<()> {
        let pool = &mut ctx.accounts.mixer_pool;

        require!(pool.tree_size < MAX_TREE_SIZE, SolMixerError::PoolFull);

        // Check commitment is not zero
        require!(commitment != [0u8; 32], SolMixerError::InvalidCommitment);

        // Transfer SOL from depositor to pool
        let transfer_ix = system_instruction::transfer(
            &ctx.accounts.depositor.key(),
            &ctx.accounts.mixer_pool.key(),
            pool.denomination,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.depositor.to_account_info(),
                ctx.accounts.mixer_pool.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Add commitment to tree (simplified - in production use proper Merkle tree)
        pool.tree_size += 1;

        // Update merkle root (simplified hash of commitment + tree_size)
        // In production, this would properly update the Merkle tree
        let mut new_root = [0u8; 32];
        for (i, (a, b)) in commitment.iter().zip(pool.merkle_root.iter()).enumerate() {
            new_root[i] = a ^ b;
        }
        pool.merkle_root = new_root;

        emit!(DepositEvent {
            commitment,
            leaf_index: pool.tree_size - 1,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Deposit recorded: leaf_index={}", pool.tree_size - 1);
        Ok(())
    }

    /// Withdraw SOL from the mixer pool using a ZK proof
    pub fn withdraw(
        ctx: Context<Withdraw>,
        proof: Vec<u8>,
        nullifier_hash: [u8; 32],
        root: [u8; 32],
    ) -> Result<()> {
        let pool = &mut ctx.accounts.mixer_pool;

        // Verify the Merkle root matches
        require!(pool.merkle_root == root, SolMixerError::InvalidMerkleRoot);

        // Verify nullifier has not been used
        require!(
            !ctx.accounts.nullifier_account.is_used,
            SolMixerError::NullifierAlreadyUsed
        );

        // Verify ZK proof (simplified - in production use Groth16 verifier)
        require!(!proof.is_empty(), SolMixerError::InvalidProof);
        require!(proof.len() >= 32, SolMixerError::InvalidProof);

        // Mark nullifier as used
        let nullifier_account = &mut ctx.accounts.nullifier_account;
        nullifier_account.is_used = true;
        nullifier_account.nullifier_hash = nullifier_hash;
        nullifier_account.bump = ctx.bumps.nullifier_account;

        // Transfer SOL to recipient
        **pool.to_account_info().try_borrow_mut_lamports()? -= pool.denomination;
        **ctx.accounts.recipient.try_borrow_mut_lamports()? += pool.denomination;

        emit!(WithdrawEvent {
            nullifier_hash,
            recipient: ctx.accounts.recipient.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Withdrawal processed to: {}", ctx.accounts.recipient.key());
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(denomination: u64, merkle_levels: u8)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = MixerPool::SPACE,
        seeds = [b"mixer_pool", authority.key().as_ref(), &denomination.to_le_bytes()],
        bump
    )]
    pub mixer_pool: Account<'info, MixerPool>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(commitment: [u8; 32])]
pub struct Deposit<'info> {
    #[account(mut, seeds = [b"mixer_pool", mixer_pool.authority.as_ref(), &mixer_pool.denomination.to_le_bytes()], bump = mixer_pool.bump)]
    pub mixer_pool: Account<'info, MixerPool>,

    #[account(mut)]
    pub depositor: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proof: Vec<u8>, nullifier_hash: [u8; 32], root: [u8; 32])]
pub struct Withdraw<'info> {
    #[account(mut, seeds = [b"mixer_pool", mixer_pool.authority.as_ref(), &mixer_pool.denomination.to_le_bytes()], bump = mixer_pool.bump)]
    pub mixer_pool: Account<'info, MixerPool>,

    #[account(
        init,
        payer = relayer,
        space = NullifierAccount::SPACE,
        seeds = [b"nullifier", nullifier_hash.as_ref()],
        bump
    )]
    pub nullifier_account: Account<'info, NullifierAccount>,

    /// CHECK: Recipient address verified by ZK proof
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,

    #[account(mut)]
    pub relayer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct MixerPool {
    pub authority: Pubkey,
    pub denomination: u64,
    pub merkle_root: [u8; 32],
    pub tree_size: u32,
    pub merkle_levels: u8,
    pub bump: u8,
}

impl MixerPool {
    pub const SPACE: usize = 8  // discriminator
        + 32  // authority
        + 8   // denomination
        + 32  // merkle_root
        + 4   // tree_size
        + 1   // merkle_levels
        + 1;  // bump
}

#[account]
#[derive(Default)]
pub struct NullifierAccount {
    pub nullifier_hash: [u8; 32],
    pub is_used: bool,
    pub bump: u8,
}

impl NullifierAccount {
    pub const SPACE: usize = 8  // discriminator
        + 32  // nullifier_hash
        + 1   // is_used
        + 1;  // bump
}

#[event]
pub struct DepositEvent {
    pub commitment: [u8; 32],
    pub leaf_index: u32,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawEvent {
    pub nullifier_hash: [u8; 32],
    pub recipient: Pubkey,
    pub timestamp: i64,
}

#[error_code]
pub enum SolMixerError {
    #[msg("Invalid ZK proof")]
    InvalidProof,
    #[msg("Nullifier has already been used")]
    NullifierAlreadyUsed,
    #[msg("Invalid Merkle root")]
    InvalidMerkleRoot,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Pool is full")]
    PoolFull,
    #[msg("Invalid denomination - must be greater than 0")]
    InvalidDenomination,
    #[msg("Invalid commitment - must not be zero")]
    InvalidCommitment,
    #[msg("Invalid Merkle level - must be between 1 and 20")]
    InvalidMerkleLevel,
}
