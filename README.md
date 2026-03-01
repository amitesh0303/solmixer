# SolMixer 🔒

> **Privacy protocol for Solana using Zero-Knowledge proofs**

SolMixer breaks the on-chain link between sender and receiver by using cryptographic commitments, Merkle trees, and Groth16 ZK proofs — inspired by Tornado Cash but built natively for Solana with Anchor.

---

## ⚠️ Legal Notice

Please ensure you comply with all applicable laws and regulations in your jurisdiction before using privacy tools. SolMixer is an open-source, neutral technology protocol.

---

## Architecture

```
solmixer/
├── circuits/           # Circom ZK circuits (Groth16 / BN128)
│   └── mixer.circom
├── programs/
│   └── solmixer/       # Anchor smart contract (Rust)
│       └── src/lib.rs
├── relayer/            # TypeScript Express relayer service
│   └── src/
│       ├── index.ts
│       ├── services/relayer.ts
│       ├── routes/
│       └── utils/
├── frontend/           # Next.js 14 React frontend
│   └── src/
│       ├── app/
│       ├── components/
│       └── utils/
└── tests/              # Anchor integration tests
    └── solmixer.ts
```

---

## How It Works

### 1. Deposit
1. User picks a fixed-denomination pool (1 SOL, 10 SOL, 100 SOL)
2. Client generates a random `nullifier` and `secret`
3. Computes `commitment = Poseidon(nullifier, secret)`
4. Sends `commitment` + `denomination` SOL on-chain → emits a `DepositEvent`
5. User saves a **secret note** (JSON file) containing nullifier + secret

### 2. Wait
The user waits for the anonymity set to grow (more deposits → more privacy).

### 3. Withdraw
1. User loads their note file in a fresh browser session / new address
2. Client generates `nullifierHash = Poseidon(nullifier)`
3. Fetches the current Merkle root and Merkle proof path from on-chain state
4. Calls `snarkjs` (Groth16) to produce a ZK proof locally in the browser
5. Submits `(proof, nullifierHash, root, recipient)` to the **relayer** endpoint
6. Relayer verifies proof and submits the withdrawal transaction on behalf of the user
7. Program checks: valid root ✓, nullifier unused ✓, proof valid ✓ → transfers SOL

### Privacy Guarantees
| Property | Mechanism |
|---|---|
| Sender unlinkability | ZK proof reveals no info about which deposit is yours |
| Double-spend prevention | On-chain nullifier accounts (PDA) |
| Relayer unlinkability | Relayer pays gas; withdrawal address never touches SOL for fees |
| Commitment hiding | Poseidon hash is collision-resistant and ZK-friendly |

---

## Components

### ZK Circuits (`circuits/`)
- Written in **Circom 2.0**
- Uses **circomlib** for Poseidon hashing and Merkle tree verification
- 20-level Merkle tree → up to 1,048,576 deposits per pool
- Public inputs: `root`, `nullifierHash`, `recipient`, `relayer`, `fee`, `refund`
- Private inputs: `nullifier`, `secret`, `pathElements[20]`, `pathIndices[20]`

### Anchor Smart Contract (`programs/solmixer/`)
- **`initialize_pool`** – creates a `MixerPool` PDA with denomination + Merkle state
- **`deposit`** – accepts a 32-byte commitment, transfers SOL into pool, updates Merkle root
- **`withdraw`** – verifies ZK proof (production: Groth16 on-chain verifier), marks nullifier used, transfers SOL to recipient
- Error codes: `InvalidProof`, `NullifierAlreadyUsed`, `InvalidMerkleRoot`, `PoolFull`, `InvalidDenomination`, `InvalidCommitment`

### Relayer (`relayer/`)
- **Express** + **TypeScript** REST API
- `POST /withdraw` – validates proof structure, submits withdrawal transaction
- `GET /status/:id` – returns transaction confirmation status  
- `GET /fees` – returns current relay fee schedule (0.1%)
- `GET /health` – liveness check
- Earns a 0.1% fee on each withdrawal for covering gas costs

### Frontend (`frontend/`)
- **Next.js 14** App Router with Tailwind CSS
- Solana wallet adapter (Phantom, Solflare)
- **Deposit flow**: pool selection → note generation → download note → on-chain deposit
- **Withdraw flow**: upload note → enter recipient → ZK proof generation → relay submission
- **History**: local-only transaction log (never leaves browser)

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- Rust + Cargo
- [Anchor CLI](https://anchor-lang.com) (`cargo install --git https://github.com/coral-xyz/anchor avm`)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- `circom` + `snarkjs` (for ZK circuits)

### 1. Clone & Install

```bash
git clone https://github.com/amitesh0303/solmixer
cd solmixer

# Install relayer deps
cd relayer && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..
```

### 2. Build & Deploy Smart Contract

```bash
# Build Anchor program
anchor build

# Deploy to localnet
solana-test-validator &
anchor deploy

# Run integration tests
anchor test
```

### 3. Start Relayer

```bash
cd relayer
cp .env.example .env
# Edit .env with your RELAYER_PRIVATE_KEY and PROGRAM_ID
npm run dev
```

### 4. Start Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

### 5. Compile ZK Circuits (optional, for production)

```bash
cd circuits
npm install
npm run compile          # generates mixer.r1cs + mixer.wasm
# Download Powers of Tau (pot12_final.ptau) then:
npm run setup            # generates mixer_0000.zkey
snarkjs zkey contribute mixer_0000.zkey mixer_final.zkey
npm run export           # generates verification_key.json
```

---

## Testing

```bash
# Relayer unit tests
cd relayer && npm test

# Frontend unit tests  
cd frontend && npm test

# Anchor integration tests (requires localnet)
anchor test
```

---

## Security Considerations

- 🔐 **Note files are the sole key to funds** — treat them like a private key
- 🌲 **Merkle root updates** are currently simplified (XOR-based); production should use full incremental Merkle tree
- ✅ **ZK proof verification** is stubbed for structure checks; production requires the compiled Groth16 on-chain verifier
- 🔒 **Relayer** trusts proof structure locally; production must call `snarkjs.groth16.verify` with the exported `verification_key.json`
- 🛡️ **Audits** — this code has not been audited; do not use with real funds without a professional security audit

---

## Tech Stack

| Layer | Technology |
|---|---|
| ZK Proofs | Circom 2.0, snarkjs, Groth16, BN128 |
| Smart Contract | Rust, Anchor 0.30, Solana |
| Relayer | TypeScript, Express, @solana/web3.js |
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Crypto | Poseidon hash (ZK-friendly), SHA-256 |
| Wallets | Phantom, Solflare (wallet-adapter) |

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT