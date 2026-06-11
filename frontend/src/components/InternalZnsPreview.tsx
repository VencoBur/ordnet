import { useState } from 'react';
import { Search, Globe, CheckCircle, Lock, Wallet } from 'lucide-react';
import { useEmbeddedWallet } from './Web3Container/useEmbeddedWallet';

interface Domain {
  name: string;
  tld: string;
  price: number;
  available: boolean;
  popular?: boolean;
}

const ALL_DOMAINS: Domain[] = [
  { name: 'ordnet', tld: '.lit', price: 12, available: true, popular: true },
  { name: 'demo', tld: '.zns', price: 8, available: true },
  { name: 'litvm', tld: '.lit', price: 25, available: false },
  { name: 'shard', tld: '.zns', price: 15, available: true, popular: true },
  { name: 'preview', tld: '.lit', price: 10, available: true },
  { name: 'web4', tld: '.zns', price: 18, available: true },
  { name: 'identity', tld: '.lit', price: 30, available: false },
  { name: 'airdrop', tld: '.zns', price: 9, available: true },
];

export default function InternalZnsPreview({ className = '' }: { className?: string }) {
  const wallet = useEmbeddedWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTld, setSelectedTld] = useState<'all' | '.lit' | '.zns'>('all');
  const [registeredDomains, setRegisteredDomains] = useState<string[]>(['mywallet.lit']);
  const [modalDomain, setModalDomain] = useState<Domain | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const isPreview = wallet.isLocked;

  const filteredDomains = ALL_DOMAINS
    .filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           `${d.name}${d.tld}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTld = selectedTld === 'all' || d.tld === selectedTld;
      return matchesSearch && matchesTld;
    })
    .sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || a.price - b.price);

  const handleRegister = (domain: Domain) => {
    if (!domain.available) return;
    const fullName = `${domain.name}${domain.tld}`;
    if (registeredDomains.includes(fullName)) return;

    setModalDomain(domain);
  };

  const confirmRegister = () => {
    if (!modalDomain) return;
    const fullName = `${modalDomain.name}${modalDomain.tld}`;
    setRegisteredDomains(prev => [...prev, fullName]);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setModalDomain(null);
    }, 1800);
  };

  const closeModal = () => {
    setModalDomain(null);
  };

  return (
    <div className={`flex flex-col h-full bg-[#0a0a0f] text-text border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Globe size={18} className="text-[#0a0a0f]" />
            </div>
            <div>
              <div className="font-semibold tracking-tight text-lg">ZNS Connect</div>
              <div className="text-[10px] text-textSecondary -mt-1">Web3 Domains • Identity • Airdrops</div>
            </div>
          </div>
          <div className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">LITVM + MULTI-CHAIN</div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className={`px-2 py-0.5 rounded-full border text-[10px] font-medium flex items-center gap-1 ${isPreview ? 'border-amber-500/40 text-amber-400 bg-amber-500/5' : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5'}`}>
            <Lock size={12} />
            {isPreview ? 'PREVIEW MODE — READ ONLY' : 'LIVE WALLET'}
          </div>
          <div className="font-mono text-[10px] text-textSecondary">
            {wallet.address ? `${wallet.address.slice(0,6)}...${wallet.address.slice(-4)}` : '0x...'}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden min-h-0">
        {/* Wallet Status Bar */}
        <div className="bg-surface border border-border rounded-lg p-3 flex-shrink-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-textSecondary" />
              <span className="text-textSecondary">Connected via</span>
              <span className="font-medium">{isPreview ? 'Locked Preview Wallet' : 'Real Wallet'}</span>
            </div>
            <div className="text-[10px] text-textSecondary/70 font-mono">
              {isPreview ? 'Read-only • No on-chain writes' : 'Balances synced from provider'}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-2.5 text-textSecondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search domains (e.g. ordnet, shard, web4)"
                className="w-full bg-background border border-border pl-9 py-2 rounded-lg text-sm focus:outline-none focus:border-primary/50 placeholder:text-textSecondary/60"
              />
            </div>
            <div className="flex rounded-lg border border-border overflow-hidden text-xs">
              {(['all', '.lit', '.zns'] as const).map(tld => (
                <button
                  key={tld}
                  onClick={() => setSelectedTld(tld)}
                  className={`px-3 py-1.5 transition ${selectedTld === tld ? 'bg-primary text-white' : 'bg-surface hover:bg-surface/80'}`}
                >
                  {tld === 'all' ? 'All' : tld}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Domains Grid */}
        <div className="flex-1 overflow-auto pr-1 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDomains.length > 0 ? (
              filteredDomains.map((domain, idx) => {
                const fullName = `${domain.name}${domain.tld}`;
                const isRegistered = registeredDomains.includes(fullName);
                const canRegister = domain.available && !isRegistered;

                return (
                  <div key={idx} className="bg-surface border border-border rounded-xl p-3.5 flex flex-col hover:border-primary/30 transition group">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-mono text-lg font-semibold tracking-tight group-hover:text-primary transition">
                          {domain.name}<span className="text-emerald-400">{domain.tld}</span>
                        </div>
                        {domain.popular && <div className="text-[10px] text-amber-400">Popular</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm">${domain.price}</div>
                        <div className="text-[10px] text-textSecondary">/yr</div>
                      </div>
                    </div>

                    <div className="flex-1 text-xs text-textSecondary mb-3">
                      {isRegistered ? 'You own this domain (preview)' : 
                       domain.available ? 'Available for registration' : 'Already registered'}
                    </div>

                    <button
                      onClick={() => handleRegister(domain)}
                      disabled={!canRegister}
                      className={`w-full py-1.5 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5
                        ${canRegister 
                          ? 'bg-primary hover:bg-primary/90 text-white' 
                          : isRegistered 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-surface text-textSecondary/60 border border-border cursor-not-allowed'}`}
                    >
                      {isRegistered ? (
                        <>Owned <CheckCircle size={14} /></>
                      ) : canRegister ? (
                        'Register in Preview'
                      ) : (
                        'Unavailable'
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8 text-textSecondary">No domains match your search.</div>
            )}
          </div>
        </div>

        {/* Owned Domains Section */}
        <div className="flex-shrink-0 bg-surface/60 border border-border/60 rounded-lg p-3">
          <div className="text-xs font-medium text-textSecondary mb-2 flex items-center gap-2">
            <CheckCircle size={14} /> YOUR DOMAINS (PREVIEW)
          </div>
          <div className="flex flex-wrap gap-2">
            {registeredDomains.length > 0 ? (
              registeredDomains.map((d, i) => (
                <div key={i} className="px-2.5 py-1 bg-background border border-border rounded text-xs font-mono flex items-center gap-1.5">
                  {d} <span className="text-emerald-400 text-[10px]">• minted</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-textSecondary/70">No domains registered in this preview session yet.</div>
            )}
          </div>
          <div className="text-[10px] text-textSecondary/60 mt-2">All registrations are simulated. Connect real wallet for actual on-chain minting.</div>
        </div>
      </div>

      {/* Register Modal */}
      {modalDomain && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <Globe size={32} className="mx-auto mb-3 text-emerald-400" />
              <div className="text-xl font-semibold">Register {modalDomain.name}{modalDomain.tld}</div>
              <div className="text-textSecondary mt-1">One-time fee: ${modalDomain.price} • Renews yearly</div>

              <div className="my-4 p-3 bg-background rounded text-xs text-left border border-border/60">
                This is a <strong>preview simulation</strong>. No transaction will be broadcast. 
                The domain will appear in "Your Domains" above for this demo session.
              </div>

              <div className="flex gap-2">
                <button onClick={closeModal} className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-surface">Cancel</button>
                <button onClick={confirmRegister} className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">Confirm Registration (Preview)</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-emerald-950 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg z-[60]">
          <CheckCircle size={16} /> Domain registered successfully in preview!
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-1.5 text-[10px] text-center text-textSecondary/60 border-t border-border/50 bg-surface/20 flex-shrink-0">
        ZNS Connect Internal Preview • Read-only • Powered by OrdNET
      </div>
    </div>
  );
}
