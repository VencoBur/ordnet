export interface Shard {
  shardId: bigint;
  title: string;
  snippet: string;
  url: string;
  inscriptionTxid: string;
  merkleProof: string;
  chain: string;
}

export type Tab = 'web2' | 'web3';
