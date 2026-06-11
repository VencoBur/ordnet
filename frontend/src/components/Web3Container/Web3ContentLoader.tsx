import { Shard } from './types';
import InternalDexPreview from '../InternalDexPreview';
import InternalZnsPreview from '../InternalZnsPreview';
import InternalLitvmPortalPreview from '../InternalLitvmPortalPreview';
import InternalLitecoinMainPreview from '../InternalLitecoinMainPreview';
import InternalLitecoinFoundationPreview from '../InternalLitecoinFoundationPreview';

interface Web3ContentLoaderProps {
  shard: Shard;
  lockedWalletProvider?: any; // kept for call-site compatibility (unused internally)
  compact?: boolean; // kept for call-site compatibility (unused internally)
  className?: string;
}

export default function Web3ContentLoader({
  shard,
  className = '',
}: Web3ContentLoaderProps) {
  const rawWeb3Url = shard.web3?.url || shard.url || '#';

  // Internal preview components for key demo shards (ZNS, LitVM Ecosystem/Portal, LitVM DEX).
  // These replace the proxy/iframe path so we always have a beautiful, reliable, full-height experience.
  const isInternalZns = shard.title === 'ZNS Connect' ||
    (shard.web3?.url || '').startsWith('internal:zns');

  const isInternalLitvmPortal = shard.title === 'LitVM Ecosystem' ||
    (shard.web3?.url || '').startsWith('internal:litvm-portal');

  const isInternalDex = shard.title === 'LitVM DEX Hub' ||
    (shard.web3?.url || '').startsWith('internal:litvmswap-dex');

  if (isInternalZns) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <InternalZnsPreview className="flex-1 min-h-0" />
      </div>
    );
  }

  if (isInternalLitvmPortal) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <InternalLitvmPortalPreview className="flex-1 min-h-0" />
      </div>
    );
  }

  if (isInternalDex) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <InternalDexPreview className="flex-1 min-h-0" />
      </div>
    );
  }

  const isLitecoinMain = shard.title === 'Litecoin' || (shard.web3?.url || '').startsWith('internal:litecoin-main');
  const isLitecoinFoundation = shard.title === 'Litecoin Foundation' || (shard.web3?.url || '').startsWith('internal:litecoin-foundation');

  if (isLitecoinMain) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <InternalLitecoinMainPreview className="flex-1 min-h-0" />
      </div>
    );
  }

  if (isLitecoinFoundation) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <InternalLitecoinFoundationPreview className="flex-1 min-h-0" />
      </div>
    );
  }

  if (!rawWeb3Url || rawWeb3Url === '#') {
    return <div className={`text-textSecondary text-sm p-4 ${className}`}>No Web3 URL configured for this shard.</div>;
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <iframe
        src={rawWeb3Url}
        title={`${shard.title} Web3`}
        className="w-full h-full border-0 bg-[#0a0a0f]"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
      />
    </div>
  );
}