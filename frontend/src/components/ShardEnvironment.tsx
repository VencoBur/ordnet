import { useState, useEffect } from 'react';
import { Lock, Globe } from 'lucide-react';
import type { Shard } from './Web3Container';
import EmbeddedWallet from './Web3Container/EmbeddedWallet';
import Web3ContentLoader from './Web3Container/Web3ContentLoader';
import { useEmbeddedWallet } from './Web3Container/useEmbeddedWallet';
import InternalLitecoinMainPreview from './InternalLitecoinMainPreview';
import InternalLitecoinFoundationPreview from './InternalLitecoinFoundationPreview';

/**
 * ShardEnvironment
 *
 * Clean, self-contained dual Web2/Web3 environment.
 * - No macOS-style title bar or modal frame.
 * - Web2/Web3 tabs attached directly to the top border.
 * - Web3 pane has a thin internal wallet bar.
 * - Content (iframes) properly fills the remaining vertical space.
 * - All content loaded internally.
 */

interface ShardEnvironmentProps {
  shard: Shard;
  onBack?: () => void;
  isLiveData?: boolean;  // true when this shard was loaded from the live contract (not demo fallback)
}

type Tab = 'web2' | 'web3';

export default function ShardEnvironment({ shard, onBack, isLiveData }: ShardEnvironmentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('web2');
  const wallet = useEmbeddedWallet();

  // Default to shard's preferred tab
  useEffect(() => {
    const preferred = shard.browser?.defaultTab;
    setActiveTab(preferred === 'web3' ? 'web3' : 'web2');
  }, [shard]);

  // Tab locking logic:
  // A tab is locked (and shows "unavailable" or lock message) if:
  // - the corresponding URL is empty (no content to show), OR
  // - the explicit web2Locked / web3Locked flag from the (live) contract data is true.
  // This prevents showing broken iframes / loaders for shards that only have one side populated.
  const web2Url = shard.web2?.url || shard.url || '';
  const hasWeb2 = !!web2Url;
  const web2Locked = !hasWeb2 || (shard.browser?.web2Locked === true);

  const web3Url = shard.web3?.url || '';
  const hasWeb3 = !!web3Url;
  const web3Locked = !hasWeb3 || (shard.browser?.web3Locked === true);

  // Web2 pane - fills remaining height.
  // For the two pure-Web2 Litecoin shards we use the existing high-quality internal mockup components
  // (reusing pattern/styling from InternalDexPreview, InternalZnsPreview, InternalLitvmPortalPreview, etc.).
  // Other shards fall back to direct iframe (or locked message).
  // Minimal fallback for locked/unavailable.
  const renderWeb2Pane = () => {
    if (web2Locked) {
      return (
        <div className="flex-1 flex items-center justify-center text-center p-4 text-[12px] text-textSecondary/70">
          Web2 unavailable for this shard.
        </div>
      );
    }

    const isLitecoinFoundation = shard.title === 'Litecoin Foundation' ||
      (shard.web2?.url || '').startsWith('internal:litecoin-foundation') ||
      String(shard.shardId) === '1';

    const isLitecoinMain = shard.title === 'Litecoin' ||
      (shard.web2?.url || '').startsWith('internal:litecoin-main') ||
      String(shard.shardId) === '2';

    if (isLitecoinFoundation) {
      return (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <InternalLitecoinFoundationPreview className="flex-1 min-h-0" />
        </div>
      );
    }

    if (isLitecoinMain) {
      return (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <InternalLitecoinMainPreview className="flex-1 min-h-0" />
        </div>
      );
    }

    // Fallback for any other web2 (e.g. real external or other internals)
    return (
      <div className="flex-1 w-full relative">
        <iframe
          src={web2Url}
          title={`${shard.title} - Web2`}
          className="absolute inset-0 w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        />
      </div>
    );
  };

  // Web3 pane - forces full remaining height
const renderWeb3Pane = () => {
  if (web3Locked) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-6 bg-surface/30">
        <div>
          <Lock size={28} className="mx-auto mb-2 text-warning" />
          <p className="text-sm text-textSecondary">Web3 content is locked for preview in this shard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <EmbeddedWallet />
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Web3ContentLoader 
          shard={shard} 
          lockedWalletProvider={wallet.lockedProvider}
          compact={true}
          className="h-full w-full flex-1" 
        />
      </div>
    </div>
  );
};

  return (
    <div className="flex-1 h-full flex flex-col">
      <div className="flex-1 h-full flex flex-col border border-border rounded-lg overflow-hidden bg-background shadow-sm min-h-0 mx-1 my-1">
        
        {/* Header inside the box */}
        <div className="px-2 py-1 flex items-center justify-between bg-surface/50 border-b border-border flex-shrink-0 text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="text-xs text-primary hover:underline"
            >
              ← Back
            </button>
            <span className="font-semibold">{shard.title}</span>
            <span className="text-xs px-1.5 py-0.5 bg-border text-textSecondary rounded font-mono">{shard.chain}</span>
          </div>

        </div>

        {/* On-chain indicator - subtle badge only when this shard came from live contract data (passed from App) */}
        {isLiveData && (
          <div className="px-2 py-0.5 text-[10px] text-center bg-[#56D3C3]/10 text-[#56D3C3] border-b border-[#56D3C3]/30 flex-shrink-0">
            On-chain • LitVM Testnet
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-surface border-b border-border flex-shrink-0">
          <button
            onClick={() => setActiveTab('web2')}
            className={`px-5 py-2 text-sm font-medium border transition-all -mb-px ${
              activeTab === 'web2'
                ? 'bg-background text-text border-border border-b-2 border-b-background'
                : 'bg-surface text-textSecondary border-border hover:bg-surface/80'
            }`}
          >
            <Globe size={14} className="inline mr-1" />
            Web2
            {web2Locked && <Lock size={11} className="ml-1 text-warning" />}
          </button>

          <button
            onClick={() => setActiveTab('web3')}
            className={`px-5 py-2 text-sm font-medium border transition-all -mb-px ${
              activeTab === 'web3'
                ? 'bg-background text-text border-border border-b-2 border-b-background'
                : 'bg-surface text-textSecondary border-border hover:bg-surface/80'
            }`}
          >
            Web3
            {web3Locked && <Lock size={11} className="ml-1 text-warning" />}
          </button>
        </div>

        {/* Main content area inside the box - flex-1 fills the remaining height after tabs.
            Panes and iframe will use h-full/flex-1 to stretch and fill the available space in this section. */}
        <div className="flex-1 h-full min-h-0 flex flex-col bg-background overflow-hidden">
          {activeTab === 'web2' ? renderWeb2Pane() : renderWeb3Pane()}

          {/* Bottom note - minimal space at very bottom of the box */}
          <div className="text-[10px] text-center text-textSecondary/60 py-0.5 flex-shrink-0 border-t border-border/50">
            All content internal • {activeTab.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}