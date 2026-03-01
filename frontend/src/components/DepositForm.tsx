'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, Download, CheckCircle } from 'lucide-react';
import { generateCommitment, NoteData } from '@/utils/crypto';
import { downloadNote } from '@/utils/note';

type DepositStep = 'select' | 'confirm' | 'deposit' | 'success';

const POOLS = [
  { denomination: 1, label: '1 SOL', description: 'High anonymity set' },
  { denomination: 10, label: '10 SOL', description: 'Medium pool' },
  { denomination: 100, label: '100 SOL', description: 'Large denomination' },
];

export default function DepositForm() {
  const [step, setStep] = useState<DepositStep>('select');
  const [selectedPool, setSelectedPool] = useState<number | null>(null);
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [noteDownloaded, setNoteDownloaded] = useState(false);

  const handlePoolSelect = (denomination: number) => {
    setSelectedPool(denomination);
    setStep('confirm');
  };

  const handleGenerateNote = async () => {
    if (!selectedPool) return;
    setLoading(true);
    try {
      const note = await generateCommitment();
      setNoteData(note);
      setStep('deposit');
    } catch (error) {
      console.error('Failed to generate commitment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadNote = () => {
    if (!noteData || !selectedPool) return;
    downloadNote(noteData, selectedPool);
    setNoteDownloaded(true);
  };

  const handleDeposit = async () => {
    if (!noteData || !selectedPool || !noteDownloaded) return;
    setLoading(true);
    try {
      // In production: call Anchor program deposit instruction
      // const tx = await program.methods.deposit(Array.from(noteData.commitment))
      //   .accounts({ mixerPool: poolPda, depositor: wallet.publicKey })
      //   .rpc();
      console.log('Depositing with commitment:', Buffer.from(noteData.commitment).toString('hex'));

      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep('success');
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'select') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Select Pool</h2>
          <p className="text-gray-400 text-sm">Choose the denomination for your private deposit</p>
        </div>
        {POOLS.map((pool) => (
          <button
            key={pool.denomination}
            onClick={() => handlePoolSelect(pool.denomination)}
            className="w-full glass-card p-5 flex items-center justify-between hover:border-[#9945ff]/40 transition-colors text-left"
          >
            <div>
              <div className="text-2xl font-bold">{pool.label}</div>
              <div className="text-gray-400 text-sm">{pool.description}</div>
            </div>
            <div className="text-[#9945ff]">→</div>
          </button>
        ))}
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="glass-card p-8">
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 text-[#9945ff] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Confirm Deposit</h2>
          <p className="text-gray-400 text-sm">You are about to deposit {selectedPool} SOL</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-yellow-500 font-medium text-sm mb-1">Important</div>
              <div className="text-yellow-500/70 text-sm">
                A secret note will be generated. You MUST download and save it — 
                this is the only way to recover your funds.
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <button
            onClick={handleGenerateNote}
            disabled={loading}
            className="w-full bg-[#9945ff] hover:bg-[#7c37cc] disabled:opacity-50 text-white py-4 rounded-xl font-semibold transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Secret Note'}
          </button>
          <button
            onClick={() => setStep('select')}
            className="w-full border border-white/20 hover:border-white/40 text-white py-4 rounded-xl font-semibold transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (step === 'deposit') {
    return (
      <div className="glass-card p-8">
        <div className="text-center mb-6">
          <Download className="w-12 h-12 text-[#14f195] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Download Your Note</h2>
          <p className="text-gray-400 text-sm">Save this file securely — it&apos;s your only access to funds</p>
        </div>
        {noteData && (
          <div className="bg-white/5 rounded-lg p-4 mb-6 font-mono text-xs text-gray-300 break-all">
            <div className="text-gray-500 mb-1">Commitment hash:</div>
            {Buffer.from(noteData.commitment).toString('hex')}
          </div>
        )}
        <div className="space-y-3">
          <button
            onClick={handleDownloadNote}
            className={`w-full ${noteDownloaded ? 'bg-[#14f195]/20 border border-[#14f195]/40 text-[#14f195]' : 'bg-[#14f195] text-black'} py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2`}
          >
            {noteDownloaded ? (
              <><CheckCircle className="w-5 h-5" /> Note Downloaded</>
            ) : (
              <><Download className="w-5 h-5" /> Download Note File</>
            )}
          </button>
          <button
            onClick={handleDeposit}
            disabled={!noteDownloaded || loading}
            className="w-full bg-[#9945ff] hover:bg-[#7c37cc] disabled:opacity-50 text-white py-4 rounded-xl font-semibold transition-colors"
          >
            {loading ? 'Depositing...' : `Deposit ${selectedPool} SOL`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 text-center">
      <CheckCircle className="w-16 h-16 text-[#14f195] mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Deposit Successful!</h2>
      <p className="text-gray-400 mb-2">Your {selectedPool} SOL has been deposited privately.</p>
      <p className="text-yellow-500/80 text-sm mb-8">
        Wait for more deposits to grow the anonymity set before withdrawing.
      </p>
      <button
        onClick={() => { setStep('select'); setNoteDownloaded(false); setNoteData(null); setSelectedPool(null); }}
        className="bg-[#9945ff] hover:bg-[#7c37cc] text-white px-8 py-3 rounded-xl font-semibold transition-colors"
      >
        New Deposit
      </button>
    </div>
  );
}
