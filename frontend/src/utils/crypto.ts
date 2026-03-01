export interface NoteData {
  nullifier: Uint8Array;
  secret: Uint8Array;
  commitment: Uint8Array;
  nullifierHash: Uint8Array;
}

function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

async function poseidonHash(inputs: Uint8Array[]): Promise<Uint8Array> {
  // Simplified hash for demonstration
  // In production, use actual Poseidon hash from circomlibjs
  const combined = new Uint8Array(inputs.reduce((acc, inp) => acc + inp.length, 0));
  let offset = 0;
  for (const input of inputs) {
    combined.set(input, offset);
    offset += input.length;
  }
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  return new Uint8Array(hashBuffer);
}

export async function generateCommitment(): Promise<NoteData> {
  const nullifier = randomBytes(31);
  const secret = randomBytes(31);

  const commitment = await poseidonHash([nullifier, secret]);
  const nullifierHash = await poseidonHash([nullifier]);

  return { nullifier, secret, commitment, nullifierHash };
}

export function serializeNote(note: NoteData): string {
  return JSON.stringify({
    nullifier: Array.from(note.nullifier),
    secret: Array.from(note.secret),
    commitment: Array.from(note.commitment),
    nullifierHash: Array.from(note.nullifierHash),
    version: '1.0.0',
    protocol: 'solmixer',
  });
}

export function deserializeNote(data: string): NoteData {
  const parsed = JSON.parse(data);
  return {
    nullifier: new Uint8Array(parsed.nullifier),
    secret: new Uint8Array(parsed.secret),
    commitment: new Uint8Array(parsed.commitment),
    nullifierHash: new Uint8Array(parsed.nullifierHash),
  };
}
