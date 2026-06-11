import { ethers } from 'ethers';

// Exact ABI for the current OrdinalReassemblerV2 contract.
export const V2_ABI = [
  "function getAllShards() view returns (tuple(uint256 shardId, string title, string web2Url, string web2Description, string web3Url, string web3Description, string browserDefaultTab, bool web2Locked, bool web3Locked, string[] searchTags, string inscriptionId, string shardIndexId, string inscriptionTxid, string chain)[])",
  "function search(string query) view returns (tuple(uint256 shardId, string title, string web2Url, string web2Description, string web3Url, string web3Description, string browserDefaultTab, bool web2Locked, bool web3Locked, string[] searchTags, string inscriptionId, string shardIndexId, string inscriptionTxid, string chain)[])",
  "function getShardsByInscription(string inscriptionId) view returns (tuple(uint256 shardId, string title, string web2Url, string web2Description, string web3Url, string web3Description, string browserDefaultTab, bool web2Locked, bool web3Locked, string[] searchTags, string inscriptionId, string shardIndexId, string inscriptionTxid, string chain)[])",
  "function getShardCount() view returns (uint256)"
];

export interface ContractShard {
  shardId: bigint;
  id?: bigint | string | number;
  title: string;
  web2Url: string;
  web2Description: string;
  web3Url: string;
  web3Description: string;
  browserDefaultTab: string;
  web2Locked: boolean;
  web3Locked: boolean;
  searchTags?: string[];
  inscriptionId: string;
  shardIndexId: string;
  inscriptionTxid: string;
  chain: string;
}

export interface NormalizedShard {
  shardId: string | number | bigint;
  title: string;
  snippet: string;
  url?: string;
  web2?: { url: string; label?: string };
  web3?: { url: string; label?: string };
  inscriptionTxid?: string;
  chain: string;
  browser: {
    defaultTab: 'web2' | 'web3';
    web2Locked: boolean;
    web3Locked: boolean;
    searchTags?: string[];
  };
  inscriptionId?: string;
  shardIndexId?: string;
}

function getProvider(): ethers.JsonRpcProvider {
  const rpcUrl = import.meta.env.VITE_LITVM_RPC_URL || 'https://liteforge.rpc.caldera.xyz/http';
  return new ethers.JsonRpcProvider(rpcUrl);
}

async function getContract() {
  const address = import.meta.env.VITE_CONTRACT_ADDRESS || '0xb630553212ffF7bFb4d1f536B940F302Cd0C7cB0';
  const provider = getProvider();
  return new ethers.Contract(address, V2_ABI, provider);
}

export function normalizeShard(s: ContractShard): NormalizedShard {
  const resolvedShardId = (s.id ?? s.shardId ?? 0) as string | number | bigint;

  const safeSearchTags = Array.isArray(s.searchTags) ? s.searchTags : [];
  const safeWeb2Url = s.web2Url || '';
  const safeWeb3Url = s.web3Url || '';
  const safeTitle = s.title || 'Untitled';
  const safeChain = s.chain || '';
  const safeInscriptionTxid = s.inscriptionTxid || '';
  const safeInscriptionId = s.inscriptionId || '';
  const safeShardIndexId = s.shardIndexId || '';

  const derivedSnippet = s.web2Description || s.web3Description || safeTitle;

  return {
    shardId: resolvedShardId,
    title: safeTitle,
    snippet: derivedSnippet,
    url: safeWeb2Url || safeWeb3Url || '',
    web2: safeWeb2Url ? { url: safeWeb2Url, label: safeTitle } : undefined,
    web3: safeWeb3Url ? { url: safeWeb3Url, label: safeTitle } : undefined,
    inscriptionTxid: safeInscriptionTxid,
    chain: safeChain,
    browser: {
      defaultTab: ((s.browserDefaultTab as 'web2' | 'web3') || 'web2'),
      web2Locked: !!s.web2Locked,
      web3Locked: !!s.web3Locked,
      searchTags: safeSearchTags,
    },
    inscriptionId: safeInscriptionId,
    shardIndexId: safeShardIndexId,
  };
}

export async function fetchAllShardsFromContract(): Promise<NormalizedShard[]> {
  try {
    const contract = await getContract();
    const shards: ContractShard[] = await contract.getAllShards();
    return shards.map(normalizeShard);
  } catch (error) {
    console.error('[contractService] Failed to fetch all shards:', error);
    throw error;
  }
}

export async function searchShardsOnChain(query: string): Promise<NormalizedShard[]> {
  try {
    const contract = await getContract();

    if (!query.trim()) {
      return fetchAllShardsFromContract();
    }

    const shards: ContractShard[] = await contract.search(query);
    return shards.map(normalizeShard);

  } catch (error: any) {
    console.error('[contractService] Contract search failed:', error);
    throw error;
  }
}

export async function getShardsByInscription(inscriptionId: string): Promise<NormalizedShard[]> {
  try {
    const contract = await getContract();
    const shards: ContractShard[] = await contract.getShardsByInscription(inscriptionId);
    return shards.map(normalizeShard);
  } catch (error) {
    console.error('[contractService] getShardsByInscription failed:', error);
    throw error;
  }
}