import { useEmbeddedWallet } from './useEmbeddedWallet';

/**
 * EmbeddedWallet
 *
 * Updated to the minimal internal thin wallet bar for the Web3 pane (as per new environment requirements).
 * 
 * Very thin horizontal bar shown only inside Web3 content areas (just below the main Web2/Web3 tabs).
 * - Left: non-dominant text label showing preview/default or real wallet state.
 * - Right: "Connect Wallet" or "Manage Wallet" button for connecting real MetaMask or disconnecting.
 *
 * Uses the existing useEmbeddedWallet hook + EmbeddedWalletProvider for state and the locked provider.
 * The locked provider is automatically active for the pane (injection handled in content loader).
 * When real wallet connects via the button, the embedded provider upgrades.
 * On disconnect, seamless fallback to locked preview.
 *
 * This replaces the previous card-style full bar to keep the UI minimal and integrated inside the tabbed environment.
 */
export default function EmbeddedWallet() {
  const wallet = useEmbeddedWallet();

  // Always expose for injection / dApp detection (iframes, etc.)
  if (typeof window !== 'undefined') {
    (window as any).__ORDNET_ACTIVE_PROVIDER = wallet.provider;
    (window as any).__ORDNET_LOCKED_PROVIDER = wallet.lockedProvider;
  }

  const shortAddr = wallet.address 
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` 
    : '';

  const label = wallet.isLocked 
    ? 'Default Wallet (Preview & Read Only)' 
    : `Wallet ${shortAddr} Connected`;

  const buttonText = wallet.isLocked ? 'Connect Wallet' : 'Manage Wallet';
  const buttonAction = wallet.isLocked ? wallet.connectReal : wallet.disconnectReal;

  return (
    <div className="w-full border-b border-border bg-surface/50">
      <div className="flex items-center justify-between px-3 py-1 text-xs">
        {/* Left: minimal non-dominant label */}
        <div className="text-textSecondary font-medium tracking-tight">
          {label}
        </div>

        {/* Right: stateful action button - minimal */}
        <button
          onClick={buttonAction}
          disabled={wallet.isConnecting}
          className="px-3 py-0.5 rounded text-[10px] font-medium border border-border hover:bg-surface text-textSecondary hover:text-text disabled:opacity-50 transition-colors"
        >
          {wallet.isConnecting ? 'Connecting...' : buttonText}
        </button>
      </div>
    </div>
  );
}

