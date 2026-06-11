/**
 * WalletBridge.ts
 * 
 * PostMessage-based wallet bridge for communicating between the parent OrdNET environment
 * and a Web3 dApp loaded inside an <iframe>.
 * 
 * This allows the locked EmbeddedWalletProvider (read-only preview wallet) to respond
 * to standard EIP-1193 read requests (eth_requestAccounts, eth_getBalance, eth_chainId, etc.)
 * sent from the iframe content via postMessage.
 * 
 * The bridge is set up automatically in Web3ContentLoader when an iframe loads.
 * It listens for messages from the iframe's contentWindow and forwards requests
 * to the provided locked provider, then posts the response back.
 * 
 * This improves wallet detection and read-only functionality for dApps that allow
 * embedding and can be configured (or via injected shim in future) to use the bridge.
 * 
 * Note: Direct window.ethereum injection is still attempted for maximum compatibility.
 * PostMessage provides a more reliable cross-origin channel when direct override is blocked.
 */

export class WalletBridge {
  private provider: any;
  private iframe: HTMLIFrameElement | null = null;
  private targetOrigin = '*'; // In production, restrict to specific dApp origins for security

  constructor(provider: any) {
    this.provider = provider;
    this.handleMessage = this.handleMessage.bind(this);
    window.addEventListener('message', this.handleMessage, false);
  }

  /**
   * Attach the bridge to a specific iframe.
   * Should be called after the iframe has loaded (or in onload handler).
   */
  public attach(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
    // Notify the iframe that the bridge is ready (dApp can listen if it supports our protocol)
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          { 
            type: 'ORDNET_WALLET_BRIDGE_READY', 
            payload: { 
              supportedMethods: ['eth_requestAccounts', 'eth_accounts', 'eth_getBalance', 'eth_chainId', 'net_version'] 
            } 
          },
          this.targetOrigin
        );
      }
    } catch (e) {
      // Cross-origin or not ready yet - ignore
    }
  }

  /**
   * Detach listeners and clear reference (call on unmount or tab switch).
   */
  public detach() {
    window.removeEventListener('message', this.handleMessage, false);
    this.iframe = null;
  }

  private async handleMessage(event: MessageEvent) {
    if (!this.iframe || event.source !== this.iframe.contentWindow) {
      return;
    }

    const data = event.data;
    if (!data || data.type !== 'ORDNET_WALLET_REQUEST' || !data.id || !data.method) {
      return;
    }

    const { id, method, params } = data;

    try {
      // Forward the request to our locked provider (read-only)
      const result = await this.provider.request({ method, params: params || [] });
      this.postResponse(id, result, null);
    } catch (error: any) {
      // Send structured error back (EIP-1193 style)
      this.postResponse(id, null, {
        code: error.code || -32603,
        message: error.message || 'Wallet bridge request failed',
      });
    }
  }

  private postResponse(id: string | number, result: any, error: any) {
    if (!this.iframe || !this.iframe.contentWindow) return;
    try {
      this.iframe.contentWindow.postMessage(
        {
          type: 'ORDNET_WALLET_RESPONSE',
          id,
          result,
          error,
        },
        this.targetOrigin
      );
    } catch (e) {
      // Ignore post errors (e.g. iframe navigated away)
    }
  }
}

// Singleton instance for the app (reused across shards/tabs)
let globalBridge: WalletBridge | null = null;

export function getWalletBridge(provider: any): WalletBridge {
  if (!globalBridge) {
    globalBridge = new WalletBridge(provider);
  } else {
    // Update provider if it changed (e.g. real wallet connected)
    (globalBridge as any).provider = provider;
  }
  return globalBridge;
}

export function setupWalletBridge(iframe: HTMLIFrameElement, provider: any) {
  const bridge = getWalletBridge(provider);
  bridge.attach(iframe);
  return bridge;
}