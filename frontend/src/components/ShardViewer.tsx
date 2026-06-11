import { useState, useEffect } from 'react';
import { ExternalLink, Lock, Globe } from 'lucide-react';
import type { Shard } from './Web3Container';
import { Web3Container } from './Web3Container';

/**
 * ShardViewer
 *
 * Dual-tab viewer for a selected Shard.
 * - Web2 tab: shows classic web content (iframe attempt + open-in-tab fallback).
 *   Respects browser.web2Locked (and presence of web2.url).
 * - Web3 tab: reuses the existing Web3Container (which handles wallet bar + launch logic).
 *   Respects browser.web3Locked.
 *
 * Initializes active tab from shard.browser.defaultTab.
 * Parent (App) is responsible for "back" navigation.
 */
interface ShardViewerProps {
  shard: Shard;
  onBack?: () => void;
}

type Tab = 'web2' | 'web3';

export default function ShardViewer({ shard, onBack }: ShardViewerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('web2');

  // Initialize / reset tab when shard changes
  useEffect(() => {
    const preferred = shard.browser?.defaultTab;
    setActiveTab(preferred === 'web3' ? 'web3' : 'web2');
  }, [shard]);

  const hasWeb2 = !!shard.web2?.url;
  const web2Locked = shard.browser?.web2Locked === true;
  const web3Locked = shard.browser?.web3Locked === true;

  const web2Url = shard.web2?.url || shard.url || '';

  const handleOpenWeb2 = () => {
    if (web2Url) {
      window.open(web2Url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Viewer Header with back + shard info */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            ← Back to Search
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-text">
              {shard.title}
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-mono rounded bg-border text-textSecondary">
              {shard.chain}
            </span>
          </div>
          <p className="mt-1 text-sm text-textSecondary max-w-2xl">{shard.snippet}</p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-surface"
          >
            Close
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-4">
        <button
          onClick={() => setActiveTab('web2')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'web2'
              ? 'border-primary text-text'
              : 'border-transparent text-textSecondary hover:text-text'
          }`}
        >
          <Globe size={16} />
          Web2
          {web2Locked && <Lock size={14} className="text-warning" />}
        </button>
        <button
          onClick={() => setActiveTab('web3')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'web3'
              ? 'border-primary text-text'
              : 'border-transparent text-textSecondary hover:text-text'
          }`}
        >
          Web3
          {web3Locked && <Lock size={14} className="text-warning" />}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[520px]">
        {activeTab === 'web2' ? (
          <Web2TabContent
            hasWeb2={hasWeb2}
            web2Locked={web2Locked}
            web2Url={web2Url}
            onOpen={handleOpenWeb2}
            shardTitle={shard.title}
          />
        ) : (
          <div className="border border-border rounded-2xl overflow-hidden bg-background">
            {/* Web3Container now includes the permanent EmbeddedWallet (Dummy or Real) + shard header + launch logic */}
            <Web3Container shard={shard} />
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="mt-4 text-[11px] text-center text-textSecondary/60">
        Dual viewer • default tab: <span className="font-mono">{shard.browser?.defaultTab}</span>
        {' • '}Data from demo-ordinal-index.json
      </div>
    </div>
  );
}

/** Internal Web2 rendering */
function Web2TabContent({
  hasWeb2,
  web2Locked,
  web2Url,
  onOpen,
  shardTitle,
}: {
  hasWeb2: boolean;
  web2Locked: boolean;
  web2Url: string;
  onOpen: () => void;
  shardTitle: string;
}) {
  if (web2Locked) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-border rounded-2xl bg-surface/50">
        <Lock size={36} className="text-warning mb-4" />
        <h3 className="text-lg font-semibold mb-2">Web2 View Locked</h3>
        <p className="max-w-sm text-textSecondary text-sm">
          This shard has disabled the classic Web2 interface for this context.
        </p>
      </div>
    );
  }

  if (!hasWeb2 || !web2Url) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-border rounded-2xl">
        <Globe size={36} className="text-textSecondary mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Web2 Content</h3>
        <p className="text-textSecondary text-sm">This shard only provides a Web3 experience.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
        <div className="text-sm text-textSecondary">
          Classic Web2 view for <span className="text-text font-medium">{shardTitle}</span>
        </div>
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Open in New Tab <ExternalLink size={15} />
        </button>
      </div>

      {/* Iframe attempt (many external sites will block this via CSP / X-Frame-Options) */}
      <div className="border border-border rounded-2xl overflow-hidden bg-[#0A0A0E] h-[520px] relative">
        <iframe
          src={web2Url}
          title={`${shardTitle} Web2`}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          // Note: Some sites refuse to render in iframes. The button above is the reliable path.
        />
        {/* Subtle overlay hint (non-blocking) */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 text-[10px] rounded bg-black/60 text-white/70 pointer-events-none">
          If content is blocked, use “Open in New Tab”
        </div>
      </div>

      <div className="text-xs text-textSecondary text-center">
        URL: <span className="font-mono text-primary/80 break-all">{web2Url}</span>
      </div>
    </div>
  );
}
