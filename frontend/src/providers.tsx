import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

// Define LitVM testnet chain (used by the wagmi config below and available for other modules if needed)
export const litvmTestnet = defineChain({
  id: 4441,
  name: 'LitVM Testnet',
  nativeCurrency: {
    name: 'zkLTC',
    symbol: 'zkLTC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://liteforge.rpc.caldera.xyz/http'],
    },
    public: {
      http: ['https://liteforge.rpc.caldera.xyz/http'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LitVM Explorer',
      url: 'https://liteforge.explorer.caldera.xyz',
    },
  },
  testnet: true,
});

/**
 * Pure Wagmi + React Query config (NO RainbowKit / Reown AppKit).
 *
 * Why we removed RainbowKit:
 * - RainbowKit's getDefaultConfig (and its internal createAppKit call) **always** initializes
 *   Reown (WalletConnect cloud) services for analytics, remote feature flags, and advanced connectors.
 * - This triggers the exact errors you are seeing, regardless of the projectId value:
 *
 *   1. "Lit is in dev mode..." 
 *      → Comes from Lit (https://lit.dev), the templating library inside Reown's web components / UI kit.
 *        It is emitted from their dev build bundles on every init when not in production mode.
 *
 *   2. POST https://pulse.walletconnect.org/e?... 400 (Bad Request)
 *      → Reown analytics / event tracking endpoint. The fake projectId causes the server to reject it.
 *
 *   3. GET https://api.web3modal.org/appkit/v1/config?... 403 (Forbidden)
 *      + "[Reown Config] Failed to fetch remote project configuration..."
 *      → Reown AppKit tries to fetch per-project feature flags, theming, and "remote features" (email/social wallets, etc.)
 *        from their cloud dashboard. A non-registered / demo projectId always returns 403.
 *
 * These calls happen deep in the RainbowKit initialization stack (see the stack traces pointing at
 * getDefaultConfig → createAppKit → AppKit.initialize → fetchRemoteFeatures / sendInitializeEvent).
 *
 * Impact on our demo: None for core functionality.
 * - The locked EmbeddedWalletProvider (for iframe injection into LitVMSwap / ZNS) is completely independent.
 * - The thin internal wallet bars (EmbeddedWallet in Web3 panes) use raw wagmi hooks.
 * - Real wallet connection for the header will still work for injected wallets (MetaMask, etc.).
 *
 * We now use the minimal wagmi `injected()` connector only. This eliminates every Reown/AppKit/Lit network
 * call and the "Lit is in dev mode" warning.
 */
const config = createConfig({
  chains: [litvmTestnet],
  connectors: [
    injected(), // MetaMask, Rabby, Brave, etc. — the only connector we need for this demo
  ],
  transports: {
    [litvmTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}