export interface Shard {
  shardId: bigint;
  title: string;
  snippet: string;
  url: string;           // Default / fallback URL
  web2Url?: string;      // Web2 version of the content
  web3Url?: string;      // Web3 version of the content
  inscriptionTxid: string;
  merkleProof: string;
  chain: string;
}

export type Tab = 'web2' | 'web3';