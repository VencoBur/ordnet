import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { defineChain } from 'viem';

// Define LitVM testnet chain
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

const config = getDefaultConfig({
  appName: 'OrdNET',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from cloud.walletconnect.com
  chains: [litvmTestnet],
  transports: {
    [litvmTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: {
              colors: {
                accentColor: '#7C6CFF',
                accentColorForeground: '#ECECF1',
              },
            },
            darkMode: {
              colors: {
                accentColor: '#7C6CFF',
                accentColorForeground: '#ECECF1',
              },
            },
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
