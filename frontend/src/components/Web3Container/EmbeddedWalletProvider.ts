/**
 * EmbeddedWalletProvider
 *
 * A limited EIP-1193 compatible provider that simulates a locked (read-only / preview) wallet.
 *
 * - Always returns a fixed dummy address for eth_requestAccounts / eth_accounts.
 * - Supports common read-only RPC methods so dApps can fetch balances, chain info, etc.
 * - Gracefully rejects (with user-friendly message) any transaction or signing methods.
 * - Emits standard events (accountsChanged, chainChanged, connect) so dApps detect the "connection".
 * - Intended to be injected into preview contexts (iframe devtools or main window global) for demo purposes.
 *
 * This makes the "embedded locked wallet" *real* from the dApp's perspective for exploration,
 * while remaining 100% non-functional for mutations.
 */

export interface EIP1193RequestArgs {
  method: string;
  params?: readonly unknown[] | object;
}

export interface EIP1193Provider {
  request(args: EIP1193RequestArgs): Promise<unknown>;
  on(event: string, listener: (...args: any[]) => void): void;
  removeListener(event: string, listener: (...args: any[]) => void): void;
  // Optional legacy
  enable?(): Promise<string[]>;
  isMetaMask?: boolean;
  isOrdnetPreview?: boolean;
}

type Listener = (...args: any[]) => void;

export class EmbeddedWalletProvider implements EIP1193Provider {
  public readonly isMetaMask = false;
  public readonly isOrdnetPreview = true;

  private readonly dummyAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
  private readonly chainIdHex = '0x1159'; // 4441 decimal = LitVM Testnet
  private readonly chainIdDecimal = 4441;

  // ~1,234.56 "zkLTC" in wei (demo value)
  private readonly dummyBalanceHex = '0x' + (123456n * 10n ** 18n).toString(16);

  private listeners: Record<string, Listener[]> = {};

  constructor() {
    // Make globally available for easy devtools injection / cross-frame access
    if (typeof window !== 'undefined') {
      (window as any).__ORDNET_LOCKED_PROVIDER = this;
      (window as any).__ordnetLockedProvider = this;
    }

    // Auto-emit a "connected" state shortly after construction so dApps see the wallet immediately
    setTimeout(() => {
      this.emit('connect', { chainId: this.chainIdHex });
      this.emit('accountsChanged', [this.dummyAddress]);
      this.emit('chainChanged', this.chainIdHex);
    }, 50);
  }

  /** Primary EIP-1193 entry point */
  async request(args: EIP1193RequestArgs): Promise<unknown> {
    const { method, params: _params = [] } = args;

    // Log for debugging in demo
    // console.debug('[OrdNET Locked Provider]', method, params);

    switch (method) {
      // --- Connection / accounts (always "connected" to dummy in locked mode) ---
      case 'eth_requestAccounts':
      case 'eth_accounts':
        return [this.dummyAddress];

      case 'eth_chainId':
        return this.chainIdHex;

      case 'net_version':
        return String(this.chainIdDecimal);

      // --- Basic read methods (so dApps can show balances, gas, etc.) ---
      case 'eth_getBalance':
        // Always return our fixed preview balance (ignore requested address for demo simplicity)
        return this.dummyBalanceHex;

      case 'eth_blockNumber':
        return '0x5b8d80'; // arbitrary plausible block

      case 'eth_gasPrice':
        return '0x3b9aca00'; // 1 gwei

      case 'eth_getTransactionCount':
        return '0x1';

      case 'eth_getBlockByNumber':
        return {
          number: '0x5b8d80',
          hash: '0x' + '0'.repeat(64),
          timestamp: '0x' + Math.floor(Date.now() / 1000).toString(16),
          gasLimit: '0x1c9c380',
        };

      case 'eth_call':
        // Very basic: return empty for most calls (real dApps may need more, but good enough for balances/positions in many UIs)
        return '0x';

      // --- Legacy / convenience ---
      case 'wallet_requestPermissions':
        return [{ parentCapability: 'eth_accounts' }];

      // --- Blocked / read-only only methods ---
      case 'eth_sendTransaction':
      case 'eth_sendRawTransaction':
      case 'personal_sign':
      case 'eth_sign':
      case 'eth_signTypedData':
      case 'eth_signTypedData_v1':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
      case 'wallet_switchEthereumChain':
      case 'wallet_addEthereumChain':
      case 'wallet_watchAsset':
        throw this.makeUserRejectedError(
          `Connect your real wallet to perform this action (${method})`
        );

      default:
        // Unknown methods: reject politely so dApps don't hard-crash
        throw new Error(`[OrdNET Preview] Method "${method}" is not supported in locked preview mode. Connect a real wallet for full functionality.`);
    }
  }

  /** Legacy support */
  async enable(): Promise<string[]> {
    return this.request({ method: 'eth_requestAccounts' }) as Promise<string[]>;
  }

  // --- Event handling (required for dApps to react to "connection") ---
  on(event: string, listener: Listener): void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  removeListener(event: string, listener: Listener): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  /** Internal emitter */
  private emit(event: string, ...args: any[]): void {
    (this.listeners[event] || []).forEach((listener) => {
      try {
        listener(...args);
      } catch (e) {
        // ignore listener errors in demo
      }
    });
  }

  // --- Utility for blocked actions ---
  private makeUserRejectedError(message: string) {
    const err = new Error(message);
    (err as any).code = 4001; // standard "user rejected" / action not allowed
    (err as any).data = { reason: 'preview-locked-wallet' };
    return err;
  }

  // --- Helpers for consumers (e.g. injection scripts) ---
  getDummyAddress(): string {
    return this.dummyAddress;
  }

  getChainId(): string {
    return this.chainIdHex;
  }

  /** Public way to re-broadcast the "connected" state (used by the hook on fallback) */
  public simulateConnection(): void {
    this.emit('connect', { chainId: this.chainIdHex });
    this.emit('accountsChanged', [this.dummyAddress]);
    this.emit('chainChanged', this.chainIdHex);
  }

  /** Returns a ready-to-paste command for devtools / console injection (works from inside iframe context via parent) */
  getInjectionCommand(): string {
    return [
      '// OrdNET Locked Preview Wallet - paste and run in the target context (iframe console or new tab)',
      'window.ethereum = (window.parent && window.parent.__ORDNET_LOCKED_PROVIDER) || window.__ORDNET_LOCKED_PROVIDER || window.__ordnetLockedProvider;',
      'if (window.ethereum) {',
      '  console.log("%c[OrdNET] Locked preview wallet injected. dApp should now see a read-only wallet.", "color:#f59e0b");',
      '  // Optional: force some dApps to re-detect',
      '  window.dispatchEvent(new Event("ethereum#initialized"));',
      '} else {',
      '  console.warn("Could not find OrdNET locked provider. Make sure EmbeddedWallet is mounted.");',
      '}',
    ].join('\n');
  }
}

// Singleton instance for stable reference across the app / multiple components
export const lockedWalletProvider = new EmbeddedWalletProvider();

// Also attach to window immediately for convenience
if (typeof window !== 'undefined') {
  (window as any).__ORDNET_LOCKED_PROVIDER = lockedWalletProvider;
  (window as any).__ordnetLockedProvider = lockedWalletProvider;
}

export default EmbeddedWalletProvider;
