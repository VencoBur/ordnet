import { useMemo, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import EmbeddedWalletProvider, { lockedWalletProvider } from './EmbeddedWalletProvider';

/**
 * useEmbeddedWallet
 *
 * Central hook for the "real embedded but locked" wallet system.
 *
 * - Provides a stable locked EIP-1193 provider (read-only dummy wallet) by default.
 * - When a real wallet is connected via wagmi (MetaMask etc.), switches to "real" mode.
 * - Exposes the active provider that dApps should see (locked or real).
 * - Handles connect/disconnect to real wallets (prioritizing MetaMask).
 * - State is driven by wagmi, so it is automatically preserved when loading new shards.
 * - Also exposes helpers for injection into iframes / new tabs.
 *
 * The locked provider is *always* available as a fallback.
 * Real wallet takes priority when present.
 */

export interface UseEmbeddedWalletReturn {
  // Current mode
  mode: 'locked' | 'real';
  isLocked: boolean;
  isReal: boolean;

  // Addresses
  address: string | undefined; // dummy or real
  dummyAddress: string;

  // The provider dApps should talk to
  provider: any; // EIP1193Provider (locked or real injected)

  // The always-available locked provider instance
  lockedProvider: EmbeddedWalletProvider;

  // Actions
  connectReal: () => void;
  disconnectReal: () => void;
  isConnecting: boolean;

  // For iframe / new-tab injection UX
  getInjectionCommand: () => string;
}

export function useEmbeddedWallet(): UseEmbeddedWalletReturn {
  const { isConnected, address, isConnecting: wagmiIsConnecting } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Stable singleton locked provider (created once, emits connect events on its own)
  const lockedProvider = useMemo(() => lockedWalletProvider, []);

  const mode: 'locked' | 'real' = isConnected ? 'real' : 'locked';
  const isLocked = mode === 'locked';
  const isReal = mode === 'real';

  // Prefer real injected provider (window.ethereum from MetaMask or other injected wallet when connected via wagmi).
  // Fall back to our locked preview provider.
  const activeProvider = useMemo(() => {
    if (isReal && typeof window !== 'undefined' && (window as any).ethereum) {
      // When real wallet is active, the extension-injected ethereum is the "real" one
      return (window as any).ethereum;
    }
    return lockedProvider;
  }, [isReal, lockedProvider]);

  // Find MetaMask connector (preferred)
  const metaMaskConnector = useMemo(() => {
    return (
      connectors.find(
        (c) =>
          c.name.toLowerCase().includes('metamask') ||
          c.id.toLowerCase().includes('metamask') ||
          c.name.toLowerCase().includes('injected')
      ) || connectors[0]
    );
  }, [connectors]);

  const connectReal = () => {
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    } else if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const disconnectReal = () => {
    disconnect();
    // The effect below + wagmi reactivity will switch us back to locked mode automatically
  };

  const isConnecting = wagmiIsConnecting || isConnectPending;

  // Keep the locked provider "fresh" - re-emit accounts if we fall back
  useEffect(() => {
    if (isLocked) {
      // Make sure dApps listening get the dummy address again
      lockedProvider.simulateConnection?.();
    }
  }, [isLocked, lockedProvider]);

  const getInjectionCommand = () => {
    if (typeof lockedProvider.getInjectionCommand === 'function') {
      return lockedProvider.getInjectionCommand();
    }
    // Fallback command
    return `window.ethereum = (window.parent && (window.parent.__ORDNET_LOCKED_PROVIDER || window.parent.__ordnetLockedProvider)) || window.__ORDNET_LOCKED_PROVIDER || window.__ordnetLockedProvider;`;
  };

  return {
    mode,
    isLocked,
    isReal,
    address: isReal ? address : lockedProvider.getDummyAddress(),
    dummyAddress: lockedProvider.getDummyAddress(),
    provider: activeProvider,
    lockedProvider,
    connectReal,
    disconnectReal,
    isConnecting,
    getInjectionCommand,
  };
}

export default useEmbeddedWallet;
