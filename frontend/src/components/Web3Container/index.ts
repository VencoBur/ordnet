/**
 * Web3Container
 *
 * Clean public API for the new Web3 sharded container system.
 *
 * Active wallet UI:
 * - EmbeddedWallet: the thin internal wallet bar used inside ShardEnvironment / Web3 panes.
 *   Backed by useEmbeddedWallet + EmbeddedWalletProvider (locked read-only preview + real wagmi/MetaMask fallback).
 *
 * Legacy (no longer used or exported):
 * - DummyWallet / RealWallet: older card-style visual components. Superseded by the minimal EmbeddedWallet bar.
 *   Files retained on disk for reference but not part of the active API to avoid confusion or accidental usage.
 */
export { default as Web3Container } from './Web3Container';
export { default as EmbeddedWallet } from './EmbeddedWallet';
export { default as Web3ContentLoader } from './Web3ContentLoader';

// Core locked embedded wallet system (used for iframe injection + thin bar state)
export { default as EmbeddedWalletProvider, lockedWalletProvider } from './EmbeddedWalletProvider';
export { useEmbeddedWallet } from './useEmbeddedWallet';

export type { Shard, BrowserConfig, WalletMode } from './types';
