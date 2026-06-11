import { X } from 'lucide-react';
import { Shard } from './types';
import EmbeddedWallet from './EmbeddedWallet';
import Web3ContentLoader from './Web3ContentLoader';
import { useEmbeddedWallet } from './useEmbeddedWallet';

/**
 * Web3Container
 *
 * Primary wrapper component for rendering a Shard inside a "Web3 Context".
 *
 * Now integrates the real embedded locked wallet system:
 * - EmbeddedWallet (top bar) is the visual control center (Dummy vs Real state via useEmbeddedWallet).
 * - The locked EIP-1193 provider is always available for dApp detection in preview mode.
 * - Web3ContentLoader receives the locked provider + injection helpers so it can offer
 *   "embedded iframe preview" (with provider injectable via devtools) vs new tab.
 *
 * Default = locked embedded wallet (detectable for reads, blocks writes).
 * Real MetaMask replaces it in both visuals and active provider.
 * Automatic fallback on real disconnect.
 * State preserved across shard changes (wagmi + singleton provider).
 */
interface Web3ContainerProps {
  shard: Shard;
  onClose?: () => void;
  className?: string;
  /** When true, hides the outer wallet bar (since environment provides the minimal one) and the shard identity header for use inside tab panes */
  compact?: boolean;
}

export default function Web3Container({
  shard,
  onClose,
  className = '',
  compact = false,
}: Web3ContainerProps) {
  const isWeb3Locked = shard.browser?.web3Locked === true;

  // Get the locked provider + helpers from the central hook.
  // This makes the provider available for the content loader (embedded iframe injection).
  const { lockedProvider, isReal } = useEmbeddedWallet();

  return (
    <div
      className={`w-full ${compact ? '' : 'border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/40'} bg-background ${className}`}
    >
      {/* Header / Wallet area - now the minimal internal bar when not compact.
         In the new ShardEnvironment the tabs sit above, and this thin bar appears inside Web3 pane.
      */}
      {!compact && (
        <div className="flex items-center justify-between border-b border-border bg-[#101014]">
          <div className="flex-1">
            <EmbeddedWallet />
          </div>

          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close Web3 context"
              className="mr-3 p-2 rounded-lg hover:bg-surface text-textSecondary hover:text-text transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Shard identity header - hidden in compact/embedded mode inside environment tabs */}
      {!compact && (
        <div className="px-5 pt-4 pb-3 border-b border-border bg-surface/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-xl font-semibold tracking-tight text-text">
                  {shard.title}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-border/70 text-textSecondary">
                  {shard.chain}
                </span>
              </div>
              {shard.snippet && (
                <p className="text-sm text-textSecondary line-clamp-2 pr-2">
                  {shard.snippet}
                </p>
              )}
            </div>

            <div className="text-right shrink-0 text-[10px] font-mono text-textSecondary pt-1">
              SHARD {typeof shard.shardId === 'bigint' ? shard.shardId.toString() : shard.shardId}
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className={compact ? 'p-2' : 'p-5'}>
        <Web3ContentLoader
          shard={shard}
          lockedWalletProvider={lockedProvider}
          compact={compact}
        />

        {/* Subtle footer note - hidden in compact mode */}
        {!compact && (
          <div className="mt-4 text-[11px] text-center text-textSecondary/70">
            Web3 Container • OrdNET Sharded Browser Preview
            {shard.browser?.defaultTab && (
              <> • default: <span className="font-mono text-textSecondary/80">{shard.browser.defaultTab}</span></>
            )}
            {isReal ? ' • using real wallet' : ' • using locked embedded provider'}
          </div>
        )}
      </div>

      {/* Optional metadata strip when not locked - hidden in compact */}
      {!compact && !isWeb3Locked && shard.web3?.url && (
        <div className="px-5 py-3 bg-surface/30 border-t border-border text-xs flex items-center justify-between text-textSecondary">
          <span>Target:</span>
          <a
            href={shard.web3.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-primary hover:underline break-all"
          >
            {shard.web3.url}
          </a>
        </div>
      )}
    </div>
  );
}
