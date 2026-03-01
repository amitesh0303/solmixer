import Link from 'next/link';
import { Shield, Zap, Lock, Eye, ChevronRight, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#9945ff]" />
          <span className="text-xl font-bold gradient-text">SolMixer</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How It Works</a>
          <a href="#pools" className="text-gray-400 hover:text-white transition-colors text-sm">Pools</a>
          <a href="#security" className="text-gray-400 hover:text-white transition-colors text-sm">Security</a>
          <Link
            href="/app"
            className="bg-[#9945ff] hover:bg-[#7c37cc] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#9945ff]/10 border border-[#9945ff]/20 rounded-full px-4 py-2 text-sm text-[#9945ff] mb-6">
            <Lock className="w-4 h-4" />
            <span>Zero-Knowledge Privacy Protocol</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Transactions,
            <br />
            <span className="gradient-text">Your Privacy</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Break the link between sender and receiver on Solana using 
            zero-knowledge proofs. Private, trustless, and open source.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 bg-[#9945ff] hover:bg-[#7c37cc] text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              Enter App <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com/amitesh0303/solmixer"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-white/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Total Deposits', value: '1,247' },
            { label: 'Total Volume', value: '8,340 SOL' },
            { label: 'Active Pools', value: '3' },
            { label: 'ZK Proofs Generated', value: '986' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            SolMixer uses cryptographic commitments and Merkle trees to enable 
            private transactions without a trusted third party.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Deposit',
                description: 'Deposit a fixed amount of SOL into a pool. Receive a secret note — this is your only key to the funds.',
                icon: '💰',
              },
              {
                step: '02',
                title: 'Wait',
                description: 'Wait for the anonymity set to grow. More deposits mean better privacy.',
                icon: '⏳',
              },
              {
                step: '03',
                title: 'Withdraw',
                description: 'Generate a ZK proof and withdraw to any new address. No link to your deposit.',
                icon: '🔐',
              },
            ].map((item) => (
              <div key={item.step} className="glass-card p-6">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-[#9945ff] text-sm font-mono mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pools */}
      <section id="pools" className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Mixing Pools</h2>
          <p className="text-gray-400 text-center mb-12">Choose your denomination for optimal privacy</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { denomination: '1 SOL', deposits: 50, color: '#14f195', popular: false },
              { denomination: '10 SOL', deposits: 20, color: '#9945ff', popular: true },
              { denomination: '100 SOL', deposits: 5, color: '#ff9945', popular: false },
            ].map((pool) => (
              <div
                key={pool.denomination}
                className={`glass-card p-6 relative ${pool.popular ? 'border-[#9945ff]/50' : ''}`}
              >
                {pool.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#9945ff] text-white text-xs px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold" style={{ color: pool.color }}>
                    {pool.denomination}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">{pool.deposits}+ deposits</div>
                </div>
                <Link
                  href="/app"
                  className="w-full flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Deposit <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Security</h2>
          <p className="text-gray-400 text-center mb-12">Built on cryptographic guarantees, not trust</p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Eye className="w-6 h-6 text-[#9945ff]" />,
                title: 'Zero-Knowledge Proofs',
                description: 'Withdraw funds without revealing which deposit is yours. Mathematically proven privacy.',
              },
              {
                icon: <Lock className="w-6 h-6 text-[#14f195]" />,
                title: 'Nullifier Protection',
                description: 'Each deposit can only be withdrawn once, preventing double-spending attacks.',
              },
              {
                icon: <Shield className="w-6 h-6 text-[#ff9945]" />,
                title: 'Open Source',
                description: 'All code, circuits, and contracts are publicly auditable. No hidden backdoors.',
              },
              {
                icon: <Zap className="w-6 h-6 text-[#9945ff]" />,
                title: 'Relayer Network',
                description: 'Submit withdrawals without linking your withdrawal address to gas payments.',
              },
            ].map((item) => (
              <div key={item.title} className="glass-card p-6 flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warning */}
      <section className="py-8 px-6 bg-yellow-500/5 border-y border-yellow-500/20">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="text-yellow-500 text-2xl">⚠️</div>
          <p className="text-yellow-500/80 text-sm">
            <strong className="text-yellow-500">Legal Notice:</strong> Please check your local laws and regulations 
            before using privacy tools. SolMixer is a neutral technology protocol.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for Privacy?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of users protecting their financial privacy on Solana.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-[#9945ff] hover:bg-[#7c37cc] text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            Launch App <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 text-center text-gray-400 text-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#9945ff]" />
            <span>SolMixer © 2024</span>
          </div>
          <div className="flex gap-6">
            <a href="https://github.com/amitesh0303/solmixer" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
            <a href="#" className="hover:text-white transition-colors">Audit</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
