import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Globe } from 'lucide-react';
import ordnetTopbarLogo from './assets/logos/ordnet-topbar-logo.png';

interface HeaderProps {
  currentAddress?: string;
}

export default function Header({ currentAddress = 'ordnet://index' }: HeaderProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleLogoClick = () => {
    window.location.reload(); // Simple reset to default state
  };

  // Prefer the injected connector (MetaMask, etc.). This is the only one we expose after removing RainbowKit.
  const injectedConnector = connectors.find(
    (c) => c.type === 'injected' || c.name.toLowerCase().includes('metamask') || c.name.toLowerCase().includes('injected')
  ) || connectors[0];

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  const handleConnect = () => {
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  const addressToShow = currentAddress || 'ordnet://index'; // safe fallback if prop temporarily undefined

  return (
    <header className="border-b border-border bg-surface sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center">
          {/* Logo - Clickable (left) - replaced with provided topbar logo image */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center cursor-pointer hover:opacity-90 transition-opacity shrink-0"
          >
            <img 
              src={ordnetTopbarLogo} 
              alt="OrdNET" 
              className="h-10 w-auto object-contain" 
            />
          </div>

          {/* Centered Address Bar (DEMO) */}
          <div className="flex-1 flex justify-center px-3 min-w-0">
            <div className="w-full max-w-[480px]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border text-xs text-textSecondary font-mono shadow-inner">
                <Globe size={13} className="shrink-0 text-textSecondary/70" />
                <span className="truncate flex-1 text-left" title={addressToShow}>
                  {addressToShow}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Hackathon badge + minimal wallet control (no RainbowKit / Reown) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-border">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-textSecondary">LiteForge Hackathon</span>
            </div>

            {/* Custom minimal header wallet button.
                This replaces RainbowKit's <ConnectButton />.
                It only uses wagmi's injected connector → no Reown AppKit, no pulse.walletconnect.org,
                no api.web3modal.org calls, and no "Lit is in dev mode" warning from Reown's UI kit. */}
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={isPending || !injectedConnector}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border border-border hover:bg-surface text-textSecondary hover:text-text disabled:opacity-50 transition-colors"
              >
                {isPending ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <div className="font-mono px-2.5 py-1 rounded-md bg-surface border border-border text-textSecondary">
                  {shortAddress}
                </div>
                <button
                  onClick={() => disconnect()}
                  className="px-2 py-1 rounded-md border border-border hover:bg-surface text-textSecondary hover:text-text text-[10px] transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}