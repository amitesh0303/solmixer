import { generateCommitment, serializeNote, deserializeNote } from '../utils/crypto';

describe('Crypto utilities', () => {
  it('should generate commitment with correct structure', async () => {
    const note = await generateCommitment();
    expect(note.nullifier).toBeInstanceOf(Uint8Array);
    expect(note.secret).toBeInstanceOf(Uint8Array);
    expect(note.commitment).toBeInstanceOf(Uint8Array);
    expect(note.nullifierHash).toBeInstanceOf(Uint8Array);
    expect(note.nullifier.length).toBe(31);
    expect(note.secret.length).toBe(31);
  });

  it('should generate unique commitments', async () => {
    const note1 = await generateCommitment();
    const note2 = await generateCommitment();
    expect(note1.commitment).not.toEqual(note2.commitment);
  });

  it('should serialize and deserialize correctly', async () => {
    const note = await generateCommitment();
    const serialized = serializeNote(note);
    const deserialized = deserializeNote(serialized);

    expect(Array.from(deserialized.nullifier)).toEqual(Array.from(note.nullifier));
    expect(Array.from(deserialized.secret)).toEqual(Array.from(note.secret));
    expect(Array.from(deserialized.commitment)).toEqual(Array.from(note.commitment));
  });
});
