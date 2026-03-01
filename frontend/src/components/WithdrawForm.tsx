'use client';

import { useState } from 'react';
import { Upload, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { NoteData } from '@/utils/crypto';
import { readNoteFile } from '@/utils/note';
import axios from 'axios';

type WithdrawStep = 'upload' | 'configure' | 'prove' | 'submit' | 'success';

const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_URL || 'http://localhost:3001';

export default function WithdrawForm() {
  const [step, setStep] = useState<WithdrawStep>('upload');
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const note = await readNoteFile(file);
      setNoteData(note);
      setStep('configure');
    } catch {
      setError('Invalid note file');
    }
  };

  const handleGenerateProof = async () => {
    if (!noteData || !recipient) return;
    setLoading(true);
    setError('');
    try {
      setStep('prove');

      // In production: generate actual ZK proof using snarkjs
      // const { proof, publicSignals } = await groth16.fullProve(
      //   { nullifier, secret, pathElements, pathIndices, root, recipient },
      //   'mixer.wasm',
      //   'mixer_final.zkey'
      // );

      // Simulate proof generation
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setStep('submit');
    } catch (err: any) {
      setError(err.message || 'Proof generation failed');
      setStep('configure');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!noteData) return;
    setLoading(true);
    setError('');
    try {
      // Submit to relayer
      const mockProof = {
        pi_a: ['0x1', '0x2', '0x1'],
        pi_b: [['0x1', '0x2'], ['0x3', '0x4'], ['0x1', '0x0']],
        pi_c: ['0x1', '0x2', '0x1'],
        protocol: 'groth16',
        curve: 'bn128',
      };

      const response = await axios.post(`${RELAYER_URL}/withdraw`, {
        proof: mockProof,
        publicSignals: [
          Buffer.from(noteData.nullifierHash).toString('hex'),
          Buffer.from(noteData.commitment).toString('hex'),
          recipient,
          recipient,
          '0',
          '0',
        ],
        recipient,
        relayer: recipient,
        fee: '1000000',
        refund: '0',
        nullifierHash: Buffer.from(noteData.nullifierHash).toString('hex'),
        root: Buffer.from(noteData.commitment).toString('hex'),
      });

      setTxSignature(response.data.txSignature);
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'upload') {
    return (
      <div className="glass-card p-8">
        <div className="text-center mb-6">
          <Upload className="w-12 h-12 text-[#9945ff] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Load Note File</h2>
          <p className="text-gray-400 text-sm">Upload your secret note file to withdraw funds</p>
        </div>
        <label className="w-full border-2 border-dashed border-white/20 hover:border-[#9945ff]/40 rounded-xl p-12 text-center cursor-pointer transition-colors block">
          <input type="file" accept=".json,.txt" onChange={handleFileUpload} className="hidden" />
          <div className="text-gray-400">
            <Upload className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <div className="text-sm">Click to upload or drag and drop</div>
            <div className="text-xs mt-1 opacity-50">JSON or TXT note file</div>
          </div>
        </label>
        {error && <div className="mt-4 text-red-400 text-sm text-center">{error}</div>}
      </div>
    );
  }

  if (step === 'configure') {
    return (
      <div className="glass-card p-8">
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 text-[#9945ff] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Configure Withdrawal</h2>
          <p className="text-gray-400 text-sm">Enter the recipient address for your funds</p>
        </div>
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana address..."
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#9945ff]/60"
          />
        </div>
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-400 mb-1">Note commitment:</div>
          <div className="text-xs font-mono text-gray-300 break-all">
            {noteData ? Buffer.from(noteData.commitment).toString('hex') : ''}
          </div>
        </div>
        {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}
        <div className="space-y-3">
          <button
            onClick={handleGenerateProof}
            disabled={!recipient || loading}
            className="w-full bg-[#9945ff] hover:bg-[#7c37cc] disabled:opacity-50 text-white py-4 rounded-xl font-semibold transition-colors"
          >
            Generate ZK Proof
          </button>
          <button
            onClick={() => setStep('upload')}
            className="w-full border border-white/20 text-white py-4 rounded-xl font-semibold transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (step === 'prove') {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 border-4 border-[#9945ff] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-2">Generating ZK Proof</h2>
        <p className="text-gray-400 text-sm">This may take a few seconds...</p>
        <div className="mt-6 text-xs font-mono text-gray-500">
          Computing witness → Building proof → Verifying...
        </div>
      </div>
    );
  }

  if (step === 'submit') {
    return (
      <div className="glass-card p-8">
        <div className="text-center mb-6">
          <CheckCircle className="w-12 h-12 text-[#14f195] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Proof Generated!</h2>
          <p className="text-gray-400 text-sm">Submit your withdrawal through a relayer</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Relay Fee</span>
            <span className="text-white text-sm">0.1%</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-400 text-sm">Recipient</span>
            <span className="text-white text-xs font-mono">{recipient.slice(0, 8)}...{recipient.slice(-4)}</span>
          </div>
        </div>
        {error && (
          <div className="flex gap-2 mb-4 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#9945ff] hover:bg-[#7c37cc] disabled:opacity-50 text-white py-4 rounded-xl font-semibold transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit via Relayer'}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 text-center">
      <CheckCircle className="w-16 h-16 text-[#14f195] mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Withdrawal Submitted!</h2>
      <p className="text-gray-400 mb-6 text-sm">Your funds will arrive at the recipient address shortly.</p>
      <div className="bg-white/5 rounded-lg p-4 mb-8">
        <div className="text-gray-400 text-xs mb-1">Transaction Signature</div>
        <div className="text-white text-xs font-mono break-all">{txSignature}</div>
      </div>
      <button
        onClick={() => { setStep('upload'); setNoteData(null); setRecipient(''); setTxSignature(''); }}
        className="bg-[#9945ff] hover:bg-[#7c37cc] text-white px-8 py-3 rounded-xl font-semibold transition-colors"
      >
        New Withdrawal
      </button>
    </div>
  );
}
