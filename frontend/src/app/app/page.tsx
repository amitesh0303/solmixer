'use client';

import { useState } from 'react';
import { Shield, Download, Upload, History } from 'lucide-react';
import Link from 'next/link';
import DepositForm from '@/components/DepositForm';
import WithdrawForm from '@/components/WithdrawForm';
import TransactionHistory from '@/components/TransactionHistory';

type Tab = 'deposit' | 'withdraw' | 'history';

export default function AppPage() {
  const [activeTab, setActiveTab] = useState<Tab>('deposit');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#9945ff]" />
          <span className="text-xl font-bold gradient-text">SolMixer</span>
        </Link>
        <div className="flex items-center gap-3">
          <button className="bg-[#9945ff] hover:bg-[#7c37cc] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Connect Wallet
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-8">
          {[
            { id: 'deposit' as Tab, label: 'Deposit', icon: <Download className="w-4 h-4" /> },
            { id: 'withdraw' as Tab, label: 'Withdraw', icon: <Upload className="w-4 h-4" /> },
            { id: 'history' as Tab, label: 'History', icon: <History className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#9945ff] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'deposit' && <DepositForm />}
        {activeTab === 'withdraw' && <WithdrawForm />}
        {activeTab === 'history' && <TransactionHistory />}
      </main>
    </div>
  );
}
