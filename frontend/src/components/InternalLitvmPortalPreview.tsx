import { useState } from 'react';
import { useEmbeddedWallet } from './Web3Container/useEmbeddedWallet';
import { Wallet, ArrowRight, ExternalLink, Lock } from 'lucide-react';

const ecosystemApps = [
  { category: "INFRASTRUCTURE", name: "LiteForge Explorer", desc: "Block explorer for LitVM testnet. Search transactions, addresses, and contracts." },
  { category: "INFRASTRUCTURE", name: "Lester Labs", desc: "Token launch, locking, vesting, airdrops, and governance tools built for LitVM." },
  { category: "PREDICTION MARKET", name: "MidasPredict", desc: "Permissionless, daily-habit-focused prediction market platform that lets users trade recurring price and event outcomes." },
  { category: "CODING PLATFORM", name: "Dappit", desc: "Dappit takes your dapp from idea to on-chain, the first AI aggregator to deploy directly to EVM." },
  { category: "LAUNCHPAD", name: "OnmiFun", desc: "Bonding curve launchpad that enables users to create, distribute, and trade tokens in a transparent and efficient manner." },
  { category: "RWA", name: "LendVault", desc: "Trade, borrow, and lend against your graded collectibles on LendVault." },
  { category: "AI", name: "AutoIncentive", desc: "x402 Facilitator: Open-source payment infrastructure enabling AI agents and apps to verify and settle USDC microtransactions on LitVM." },
  { category: "DEFI", name: "Ayni", desc: "Ayni unlocks LTC DeFi potential with a novel cross-chain stablecoin lending protocol." },
  { category: "PRIVACY", name: "LitCash", desc: "A secure, non-custodial solution designed to protect your privacy." },
  { category: "DEX", name: "LiteSwap", desc: "Litecoin-first DEX where users can swap, provide liquidity, stake LP, and earn rewards in one simple flow." },
  { category: "NFT", name: "ZNS Connect", desc: "Identity layer of Web3. Domains, NFTs and more." },
  { category: "PREDICTION MARKET", name: "Penny4Thots", desc: "A fully on-chain prediction marketplace piloting a decentralized cross-model AI consensus system." },
  { category: "DEX", name: "WolfDex", desc: "Multichain DEX on LitVM. Swap, provide liquidity, and ride the wolf." },
  { category: "DEX", name: "LitVMSwap", desc: "A cross-liquidity hybrid DEX (AMM + Aggregation) native to LitVM." },
  { category: "INFRASTRUCTURE", name: "Lit Clinic", desc: "Onchain wallet analysis & smart contract lab. Analyze, interact, and deploy with a simple UX." },
  { category: "AI", name: "AI Deathmatch", desc: "Live on-chain arena where AI agents battle on prediction markets and users bet on the winner." },
  { category: "AUDIT", name: "LitAudit", desc: "Scans LitVM tokens in real time, detecting scams, risks, and vulnerabilities with instant safety insights." },
  { category: "SOCIAL", name: "OnChainGM", desc: "Your daily Web3 ritual." },
  { category: "DOMAINS", name: "InfinityName", desc: "True digital identity: register once, keep forever, with no renewals and no rent." },
  { category: "SOCIAL", name: "Arkada", desc: "Level up your reputation, complete quests, and unlock exclusive rewards." },
  { category: "DEX", name: "Addax", desc: "Ultra-efficient trading, CLMM, aggregators and DCA tools." },
  { category: "NFT", name: "OmniHub", desc: "Launchpad for blockchain collectibles. Create, buy and sell as your most creative ideas come to life." },
  { category: "NFT", name: "Sweep", desc: "Multi-chain NFT launcher designed to simplify NFT drops on all compatible EVM chains." },
  { category: "GAMING", name: "LitBillionaire", desc: "On-chain weekly lottery. Buy tickets, match numbers, win prizes." },
  { category: "DEFI", name: "Drunken Cats", desc: "DEX on LitVM LiteForge. Swap tokens, provide liquidity, and track your portfolio." },
  { category: "GAMING", name: "Last Hero", desc: "Cyberpunk-style last-player game on LitVM: buy a ticket, become the hero, win 90% of the pot." },
  { category: "DEFI", name: "LitDeX", desc: "Swap, add liquidity and deploy ERC20/NFT/Staking contracts with no coding needed." },
  { category: "DEFI", name: "Fenus", desc: "CDP protocol on LitVM enabling users to borrow against their zkLTC holdings." },
  { category: "NFT", name: "Mintbrush", desc: "Discover, collect, stake, draw and sell extraordinary NFTs." },
  { category: "GAMING", name: "Faros Beacon", desc: "On-chain gaming protocol, designed to deliver transparent, verifiable, and rewarding gameplay." },
  { category: "NFT", name: "StampVM", desc: "No-code NFT launchpad built exclusively for LitVM." },
  { category: "SOCIAL", name: "LitNames", desc: "Register a .litvm name, send zkLTC by name. On-chain and non-custodial." },
  { category: "DEX", name: "LitiumDEX", desc: "A simple DEX on LitVM, allowing users to trade tokens seamlessly." },
  { category: "PREDICTION MARKET", name: "Olympus", desc: "The first prediction DEX; trade any token and bet on its next move in one session." },
  { category: "AI", name: "LitScore", desc: "Real-time LitVM wallet scoring, behavioral analytics & reputation insights powered by AI." },
  { category: "DEFI", name: "Multyra", desc: "Cross-chain bridge & swaps. Bridge your zkLTC between LiteForge and Ethereum in seconds." },
  { category: "DEFI", name: "WheelX", desc: "AI-powered bridge & swap aggregator." },
  { category: "GAMING", name: "LitGames", desc: "Fast on-chain arcade with verifiable randomness." },
  { category: "DEFI", name: "LitStake", desc: "Liquid staking protocol." },
  { category: "STABLECOIN", name: "Forged", desc: "Overcollateralized zkLTC-backed stablecoin system and broader DeFi product suite." },
  { category: "LAUNCHPAD", name: "LitPump", desc: "Token launchpad on LitVM. Fair launch with bonding curves and automatic graduation." },
  { category: "GAMING", name: "Falken", desc: "AI vs AI gaming platform allowing agents to play games with USDC stakes. Humans bet on the outcomes." },
  { category: "DEX", name: "Magentar Finance", desc: "DeFi cosmos on LitVM. Facilitator of aggregated intrac-chain & cross-chain swaps and payments." },
  { category: "RPC", name: "RPC LitVM", desc: "Community-run RPC gateway." },
];

const categories = ["All", "Infrastructure", "DeFi", "NFT", "Social & Gaming", "RWA & AI"];

export default function InternalLitvmPortalPreview({ className = '' }: { className?: string }) {
  const wallet = useEmbeddedWallet();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [showFaucetNote, setShowFaucetNote] = useState(false);

  const isPreview = wallet.isLocked;

  const filteredApps = ecosystemApps.filter(app => {
    const matchesCategory = activeCategory === "All" || app.category.toUpperCase().includes(activeCategory.toUpperCase());
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         app.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToWallet = () => {
    setShowAddWalletModal(true);
    setTimeout(() => setShowAddWalletModal(false), 2500);
  };

  const handleGetZkLTC = () => {
    setShowFaucetNote(true);
    setTimeout(() => setShowFaucetNote(false), 3000);
  };

  return (
    <div className={`flex flex-col h-full bg-[#0a0a0f] text-text overflow-hidden border border-border rounded-lg ${className}`}>
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-[#111113] to-[#0a0a0f] border-b border-border px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-medium">Testnet Live</div>
            <span className="font-semibold">LitVM Testnet | Live Now</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400">4441 Chain ID</span>
            <span>•</span>
            <span>zkLTC Gas Token</span>
            <span>•</span>
            <span>Arbitrum Orbit Rollup</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-6 py-8 border-b border-border bg-[#111113] flex-shrink-0">
        <div className="max-w-3xl">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-3">LITVM TESTNET</div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">LiteForge Testnet is Live</h1>
          <p className="text-lg text-textSecondary mb-6 max-w-2xl">
            LitVM is Litecoin's EVM rollup, built using the Arbitrum Nitro stack. Add the network, explore the ecosystem, and start building.
          </p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleAddToWallet}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#0a0a0f] font-medium hover:bg-white/90 transition"
            >
              Add LitVM to Wallet <ArrowRight size={16} />
            </button>
            <button 
              onClick={handleGetZkLTC}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-surface transition"
            >
              Get zkLTC
            </button>
          </div>
          <div className="mt-3 text-xs text-textSecondary">
            Works with MetaMask · Rabby · Coinbase Wallet · Rainbow
          </div>
          <div className="mt-2 text-[10px] text-amber-400">
            Having trouble with the faucet? Caldera Hub can rate-limit VPN or proxy traffic. Try pausing your VPN, switching regions, or retrying after a few minutes.
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="px-6 py-6 border-b border-border flex-shrink-0 bg-surface/30">
        <h3 className="font-semibold mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex gap-3">
            <div className="font-mono text-xs bg-border/50 px-2 py-1 rounded self-start mt-0.5">01</div>
            <div>
              <div className="font-medium">Add LitVM to Your Wallet</div>
              <div className="text-textSecondary text-xs mt-0.5">Click the button above. Supports MetaMask, Rabby, Coinbase Wallet, and any EVM-compatible wallet.</div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="font-mono text-xs bg-border/50 px-2 py-1 rounded self-start mt-0.5">02</div>
            <div>
              <div className="font-medium">Get zkLTC Testnet Tokens</div>
              <div className="text-textSecondary text-xs mt-0.5">You will need zkLTC for gas. Use the Caldera Hub faucet above. Disable VPN if issues arise.</div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="font-mono text-xs bg-border/50 px-2 py-1 rounded self-start mt-0.5">03</div>
            <div>
              <div className="font-medium">Explore the Ecosystem (Users)</div>
              <div className="text-textSecondary text-xs mt-0.5">Scroll to the 'Ecosystem' section below and browse apps live on LitVM testnet.</div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="font-mono text-xs bg-border/50 px-2 py-1 rounded self-start mt-0.5">04</div>
            <div>
              <div className="font-medium">Deploy Your Contracts (Builders)</div>
              <div className="text-textSecondary text-xs mt-0.5">LitVM is fully EVM-compatible. Deploy Solidity contracts using Hardhat, Foundry, or Remix.</div>
              <a href="#" className="text-xs text-primary inline-flex items-center gap-1 mt-0.5">Written Tutorial <ExternalLink size={12} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Section */}
      <div className="flex-1 overflow-auto p-6 min-h-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-semibold">Explore the Ecosystem</h2>
            <p className="text-sm text-emerald-400">New apps weekly</p>
          </div>
          <div className="text-xs text-amber-400/80 max-w-xs text-right">
            CAUTION: LitVM does not officially endorse any of the applications listed. They may be unaudited.
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-xs rounded-full border transition ${activeCategory === cat ? 'bg-primary border-primary text-white' : 'border-border hover:bg-surface'}`}
            >
              {cat}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search apps..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="ml-auto bg-background border border-border text-xs px-3 py-1 rounded-full w-48 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredApps.map((app, index) => (
            <div key={index} className="bg-surface border border-border rounded-xl p-3.5 hover:border-primary/40 transition flex flex-col">
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-1">{app.category}</div>
              <div className="font-semibold mb-1">{app.name}</div>
              <p className="text-xs text-textSecondary flex-1 leading-snug">{app.desc}</p>
              <div className="mt-3 text-[10px] text-primary flex items-center gap-1 cursor-default">
                Visit app <ArrowRight size={12} />
              </div>
            </div>
          ))}
          {filteredApps.length === 0 && (
            <div className="col-span-full text-center text-textSecondary py-8">No apps match your filter.</div>
          )}
        </div>

        {/* Coming Soon */}
        <div className="mt-8">
          <h3 className="font-semibold mb-2 text-sm">Coming Soon</h3>
          <div className="text-xs text-textSecondary">More Apps — New applications launching on LitVM testnet every week.</div>
          <div className="mt-3 text-xs">
            <span className="text-primary cursor-default">BUILDERS</span> — Deployed on LitVM testnet? Submit your app for listing here in the ecosystem directory.
          </div>
        </div>

        {/* Network Info */}
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="font-semibold mb-3">Network Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="flex justify-between border-b border-border/60 py-1"><span className="text-textSecondary">Network Name</span> <span>LitVM LiteForge</span></div>
            <div className="flex justify-between border-b border-border/60 py-1"><span className="text-textSecondary">Chain ID</span> <span>4441</span></div>
            <div className="flex justify-between border-b border-border/60 py-1"><span className="text-textSecondary">Gas Token</span> <span>zkLTC</span></div>
            <div className="flex justify-between border-b border-border/60 py-1"><span className="text-textSecondary">RPC (HTTP)</span> <span className="font-mono text-xs">https://liteforge.rpc.caldera.xyz/http</span></div>
            <div className="flex justify-between border-b border-border/60 py-1"><span className="text-textSecondary">RPC (WebSocket)</span> <span className="font-mono text-xs">wss://liteforge.rpc.caldera.xyz/ws</span></div>
            <div className="flex justify-between border-b border-border/60 py-1"><span className="text-textSecondary">Block Explorer</span> <span className="font-mono text-xs">https://liteforge.explorer.caldera.xyz</span></div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="font-semibold mb-3">FAQ</h3>
          <div className="space-y-3 text-sm">
            <div><span className="font-medium">What is LitVM?</span> — Litecoin's EVM rollup built with Arbitrum Nitro stack.</div>
            <div><span className="font-medium">Which wallets are supported?</span> — MetaMask, Rabby, Coinbase Wallet, Rainbow and any EVM wallet.</div>
            <div><span className="font-medium">What is zkLTC?</span> — The native gas token for LitVM testnet.</div>
            <div><span className="font-medium">How do I get testnet tokens?</span> — Use the "Get zkLTC" button (Caldera Hub faucet). Pause VPN if rate-limited.</div>
            <div><span className="font-medium">Is this mainnet?</span> — No, this is the LiteForge testnet.</div>
            <div><span className="font-medium">Can I list my app?</span> — Yes, use the "Submit Your App" section below.</div>
            <div><span className="font-medium">What can I build on LitVM?</span> — Anything EVM-compatible: DeFi, NFTs, gaming, AI agents, etc.</div>
          </div>
        </div>
      </div>

      {/* Bottom bar with wallet state */}
      <div className="px-4 py-2 border-t border-border bg-surface/40 text-xs flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          {isPreview ? (
            <span className="flex items-center gap-1 text-amber-400"><Lock size={12} /> Preview Mode — Read Only</span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400"><Wallet size={12} /> Real wallet connected</span>
          )}
          <span className="text-textSecondary/70 font-mono">{wallet.address ? wallet.address.slice(0,10) + '...' : ''}</span>
        </div>
        <div className="text-textSecondary/60">Internal OrdNET Preview • Matches testnet.litvm.com layout</div>
      </div>

      {/* Preview Modals */}
      {showAddWalletModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[100] text-center p-4">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-sm">
            <div className="font-medium mb-2">Add LitVM to Wallet (Preview)</div>
            <div className="text-sm text-textSecondary">In a real session this would trigger the wallet_addEthereumChain call. Chain ID 4441, RPC https://liteforge.rpc.caldera.xyz/http, Currency zkLTC.</div>
            <div className="mt-3 text-xs text-amber-400">This is a simulated action for the demo.</div>
          </div>
        </div>
      )}
      {showFaucetNote && (
        <div className="absolute bottom-4 right-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-3 py-1.5 rounded">Faucet note shown — try pausing VPN in real use.</div>
      )}
    </div>
  );
}
