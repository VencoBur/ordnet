export interface BrowserConfig {
  /**
   * Default tab to activate when this shard's Web3 context is opened.
   * Typically 'web2' for classic content or 'web3' for on-chain/dapp experiences.
   */
  defaultTab: 'web2' | 'web3';

  /** When true, the Web2 experience is considered locked / unavailable in this context. */
  web2Locked: boolean;

  /** When true, the Web3 launch path is locked (shows locked state instead of launch button). */
  web3Locked: boolean;

  /** Tags used for search / discovery associated with the shard. */
  searchTags?: string[];
}

export interface Shard {
  /** Unique identifier for the shard (string for demo JSON; bigint when coming from contract). */
  shardId: string | bigint;

  /** Human-readable title of the shard / site. */
  title: string;

  /** Short descriptive snippet / abstract. */
  snippet: string;

  /** Canonical / fallback URL. */
  url?: string;

  /** Web2 representation of the content (classic site). */
  web2?: {
    url: string;
    label?: string;
  };

  /** Web3 / on-chain / dapp URL for this shard. */
  web3?: {
    url: string;
    label?: string;
  };

  /** Inscription transaction id on the source chain (Litecoin Ordinals etc). */
  inscriptionTxid?: string;

  /** Merkle proof or other verification artifact. */
  merkleProof?: string;

  /** Source chain / namespace (e.g. "Litecoin", "Bitcoin", "DeFi"). */
  chain: string;

  /** Browser behavior and locking configuration for Web2/Web3 presentation. */
  browser: BrowserConfig;
}

/**
 * Wallet mode used by the embedded wallet system.
 * - 'dummy': permanent read-only preview (default, always shown when no real wallet)
 * - 'real': live wagmi-connected wallet (MetaMask etc.) takes over
 */
export type WalletMode = 'dummy' | 'real';
