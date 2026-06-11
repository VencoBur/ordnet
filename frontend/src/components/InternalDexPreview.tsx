import { useState } from 'react';
import { ArrowDown, TrendingUp, Droplet, BarChart3, Info } from 'lucide-react';
import { useEmbeddedWallet } from './Web3Container/useEmbeddedWallet';
import { useBalance } from 'wagmi';
import { formatUnits } from 'viem';

interface Token {
  symbol: string;
  name: string;
  decimals: number;
}

const TOKENS: Record<string, Token> = {
  zkLTC: { symbol: 'zkLTC', name: 'zkLTC (Native)', decimals: 18 },
  USDC: { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
};

const FAKE_RATES: Record<string, number> = {
  'zkLTC-USDC': 1850.25,
  'USDC-zkLTC': 1 / 1850.25,
};

export default function InternalDexPreview({ className = '' }: { className?: string }) {
  const wallet = useEmbeddedWallet();

  const [fromSymbol, setFromSymbol] = useState<keyof typeof TOKENS>('zkLTC');
  const [toSymbol, setToSymbol] = useState<keyof typeof TOKENS>('USDC');
  const [fromAmount, setFromAmount] = useState('100.0');
  const [showSimulated, setShowSimulated] = useState(false);

  // Real balance fetch (only meaningful when real wallet connected)
  const { data: nativeBalance } = useBalance({
    address: wallet.address as `0x${string}` | undefined,
    chainId: 4441, // LitVM Testnet
  });

  const rateKey = `${fromSymbol}-${toSymbol}` as keyof typeof FAKE_RATES;
  const rate = FAKE_RATES[rateKey] ?? 1;
  const toAmount = (parseFloat(fromAmount) || 0) * rate;

  // Balances: prefer real when connected, otherwise attractive preview numbers
  const getDisplayBalance = (symbol: keyof typeof TOKENS) => {
    if (wallet.isReal && symbol === 'zkLTC' && nativeBalance) {
      const formatted = parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals)).toFixed(3);
      return formatted;
    }
    // Locked / preview demo balances (realistic but fake)
    if (symbol === 'zkLTC') return wallet.isReal ? '892.341' : '1,234.567';
    if (symbol === 'USDC') return wallet.isReal ? '12,450.00' : '5,678.90';
    return '0.00';
  };

  const fromBalance = getDisplayBalance(fromSymbol);
  const toBalance = getDisplayBalance(toSymbol);

  const handleFlip = () => {
    const newFrom = toSymbol;
    const newTo = fromSymbol;
    setFromSymbol(newFrom);
    setToSymbol(newTo);
    // Recompute amount roughly to keep similar value
    const newFromAmount = (parseFloat(fromAmount) * rate).toFixed(2);
    setFromAmount(newFromAmount);
  };

  const handleMax = () => {
    setFromAmount(fromBalance.replace(/,/g, ''));
  };

  const handleSwap = () => {
    setShowSimulated(true);
    // Auto hide after a moment
    setTimeout(() => setShowSimulated(false), 2200);
    // In a real integration this would call the provider, but we are read-only
  };

  const isPreview = wallet.isLocked;

  return (
    <div className={`flex flex-col h-full bg-[#0a0a0f] text-text border border-border rounded-lg overflow-hidden ${className}`}>
      {/* DEX Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <div>
              <div className="font-semibold tracking-tight">LitVMSwap</div>
              <div className="text-[10px] text-textSecondary -mt-0.5">Hybrid CLOB + AMM</div>
            </div>
          </div>
          <div className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">LITVM TESTNET</div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${isPreview ? 'border-amber-500/40 text-amber-400 bg-amber-500/5' : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5'}`}>
            {isPreview ? 'PREVIEW MODE — READ ONLY' : 'LIVE WALLET CONNECTED'}
          </div>
          <div className="text-textSecondary font-mono text-[10px]">
            {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'No address'}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4 min-h-0">
        {/* Balances */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <div className="text-xs font-medium text-textSecondary tracking-wide">YOUR BALANCES</div>
            {isPreview && (
              <div className="text-[10px] text-amber-400/80">Using locked preview wallet</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface border border-border rounded p-2.5">
              <div className="flex justify-between items-baseline">
                <div className="text-xs text-textSecondary">{TOKENS.zkLTC.symbol}</div>
                <div className="text-[10px] text-textSecondary/70">Native</div>
              </div>
              <div className="font-mono text-lg tabular-nums mt-0.5">{getDisplayBalance('zkLTC')}</div>
            </div>
            <div className="bg-surface border border-border rounded p-2.5">
              <div className="flex justify-between items-baseline">
                <div className="text-xs text-textSecondary">{TOKENS.USDC.symbol}</div>
                <div className="text-[10px] text-textSecondary/70">Stable</div>
              </div>
              <div className="font-mono text-lg tabular-nums mt-0.5">{getDisplayBalance('USDC')}</div>
            </div>
          </div>
        </div>

        {/* Swap Interface */}
        <div className="bg-surface border border-border rounded-xl p-3 flex flex-col flex-shrink-0">
          <div className="text-xs font-medium text-textSecondary px-1 mb-2">SWAP</div>

          {/* From */}
          <div className="bg-background border border-border rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-textSecondary mb-1">
              <span>From</span>
              <button onClick={handleMax} className="text-primary hover:underline text-[10px]">MAX</button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-full bg-transparent text-2xl font-mono outline-none placeholder:text-textSecondary/40"
                  placeholder="0.0"
                />
              </div>
              <button
                onClick={() => {
                  const next = fromSymbol === 'zkLTC' ? 'USDC' : 'zkLTC';
                  setFromSymbol(next);
                  if (next === toSymbol) setToSymbol(fromSymbol);
                }}
                className="px-3 py-1 rounded bg-[#111113] border border-border text-sm font-medium hover:bg-surface transition"
              >
                {fromSymbol}
              </button>
            </div>
            <div className="text-[10px] text-textSecondary mt-0.5">Balance: {fromBalance} {fromSymbol}</div>
          </div>

          {/* Flip button */}
          <div className="flex justify-center my-1">
            <button
              onClick={handleFlip}
              className="p-1.5 rounded-full border border-border bg-surface hover:bg-background transition"
              title="Flip tokens"
            >
              <ArrowDown size={16} />
            </button>
          </div>

          {/* To */}
          <div className="bg-background border border-border rounded-lg p-3">
            <div className="text-xs text-textSecondary mb-1">To (estimated)</div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-2xl font-mono tabular-nums text-textSecondary">
                  {toAmount.toFixed(toSymbol === 'zkLTC' ? 4 : 2)}
                </div>
              </div>
              <button
                onClick={() => {
                  const next = toSymbol === 'zkLTC' ? 'USDC' : 'zkLTC';
                  setToSymbol(next);
                  if (next === fromSymbol) setFromSymbol(toSymbol);
                }}
                className="px-3 py-1 rounded bg-[#111113] border border-border text-sm font-medium hover:bg-surface transition"
              >
                {toSymbol}
              </button>
            </div>
            <div className="text-[10px] text-textSecondary mt-0.5">Balance: {toBalance} {toSymbol}</div>
          </div>

          {/* Rate & Info */}
          <div className="mt-2 px-1 text-[11px] flex items-center justify-between text-textSecondary">
            <div>
              1 {fromSymbol} ≈ {rate.toFixed(2)} {toSymbol}
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <TrendingUp size={12} /> 0.12% impact
            </div>
          </div>

          {/* Action */}
          <button
            onClick={handleSwap}
            disabled={!fromAmount || parseFloat(fromAmount) <= 0}
            className="mt-3 w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 active:bg-primary/80 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium transition flex items-center justify-center gap-2"
          >
            {isPreview ? 'PREVIEW SWAP (READ ONLY)' : 'SWAP'}
            {isPreview && <Info size={14} />}
          </button>

          {showSimulated && (
            <div className="mt-2 text-center text-[11px] text-amber-400">
              Transaction simulated — no on-chain execution in preview mode.
            </div>
          )}

          <div className="mt-2 text-center text-[10px] text-textSecondary/70">
            {isPreview
              ? 'Using locked preview wallet. Connect a real wallet via the bar above to trade live.'
              : 'Real wallet active. Balances reflect on-chain state (read-only preview context).'}
          </div>
        </div>

        {/* Simple Price Chart Area */}
        <div className="flex-1 min-h-[110px] bg-surface border border-border rounded-xl p-3 flex flex-col">
          <div className="flex items-center justify-between text-xs mb-1 px-0.5">
            <div className="font-medium">Price Chart (simulated)</div>
            <div className="text-emerald-400 text-[10px] flex items-center gap-1">
              <Droplet size={12} /> 24h +3.8%
            </div>
          </div>
          <div className="flex-1 relative">
            <svg className="w-full h-full" viewBox="0 0 320 90" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {/* Area */}
              <path
                d="M10,70 L40,58 L70,62 L100,42 L130,48 L160,28 L190,35 L220,20 L250,25 L280,15 L310,22 L310,80 L10,80 Z"
                fill="url(#chartGrad)"
              />
              {/* Line */}
              <polyline
                points="10,70 40,58 70,62 100,42 130,48 160,28 190,35 220,20 250,25 280,15 310,22"
                fill="none"
                stroke="#a78bfa"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Dots */}
              {[10,40,70,100,130,160,190,220,250,280,310].map((x, i) => (
                <circle key={i} cx={x} cy={[70,58,62,42,48,28,35,20,25,15,22][i]} r="2" fill="#c4b5fd" />
              ))}
            </svg>
            <div className="absolute bottom-1 right-2 text-[9px] text-textSecondary/50 font-mono">Last 24h</div>
          </div>
        </div>

        {/* Liquidity & Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs flex-shrink-0">
          <div className="bg-surface border border-border rounded p-2">
            <div className="text-textSecondary text-[10px]">Pool TVL</div>
            <div className="font-mono text-base mt-0.5">$2.41M</div>
          </div>
          <div className="bg-surface border border-border rounded p-2">
            <div className="text-textSecondary text-[10px]">24h Volume</div>
            <div className="font-mono text-base mt-0.5">$184k</div>
          </div>
          <div className="bg-surface border border-border rounded p-2">
            <div className="text-textSecondary text-[10px]">Liquidity</div>
            <div className="font-mono text-base mt-0.5">142.8k zkLTC</div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="px-3 py-1 text-[10px] text-center text-textSecondary/60 border-t border-border/50 bg-surface/20 flex-shrink-0">
        Internal OrdNET Preview • All actions are simulated • Connect real wallet for on-chain execution
      </div>
    </div>
  );
}
