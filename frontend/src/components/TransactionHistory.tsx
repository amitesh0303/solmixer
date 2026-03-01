'use client';

import { useState, useEffect } from 'react';
import { Clock, ArrowDown, ArrowUp, ExternalLink } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  txSignature?: string;
}

function getTransactionHistory(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('solmixer_history');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setTransactions(getTransactionHistory());
  }, []);

  if (transactions.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">No Transaction History</h3>
        <p className="text-gray-500 text-sm">Your deposit and withdrawal history will appear here.</p>
        <p className="text-gray-600 text-xs mt-2">History is stored locally only — no data leaves your browser.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Transaction History</h2>
        <span className="text-gray-500 text-xs">Local only</span>
      </div>
      {transactions.map((tx) => (
        <div key={tx.id} className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              tx.type === 'deposit' ? 'bg-[#9945ff]/20' : 'bg-[#14f195]/20'
            }`}>
              {tx.type === 'deposit' ? (
                <ArrowDown className={`w-5 h-5 text-[#9945ff]`} />
              ) : (
                <ArrowUp className={`w-5 h-5 text-[#14f195]`} />
              )}
            </div>
            <div>
              <div className="font-medium capitalize">{tx.type}</div>
              <div className="text-gray-400 text-xs">
                {new Date(tx.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">{tx.amount} SOL</div>
            <div className={`text-xs capitalize ${
              tx.status === 'confirmed' ? 'text-[#14f195]' :
              tx.status === 'pending' ? 'text-yellow-500' : 'text-red-400'
            }`}>
              {tx.status}
            </div>
          </div>
          {tx.txSignature && (
            <a
              href={`https://explorer.solana.com/tx/${tx.txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 text-gray-500 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
