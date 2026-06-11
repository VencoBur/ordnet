import { describe, it, expect } from 'vitest';

// We test the exported normalizeShard + simulate the search path via mocks.
// This verifies that real contract payloads get properly normalized (incl. searchTags).

import {
  normalizeShard,
  ContractShard,
  NormalizedShard,
  // searchShardsOnChain is harder to unit-test without full env mock, but we cover the core normalizer
} from './contractService';

describe('contractService', () => {
  const mockRealPayload: ContractShard = {
    shardId: BigInt(1),
    title: 'LitVM Ecosystem',
    web2Url: '',
    web2Description: '',
    web3Url: 'https://testnet.litvm.com',
    web3Description: 'LitVM Testnet Ecosystem Portal',
    browserDefaultTab: 'web3',
    web2Locked: true,
    web3Locked: false,
    searchTags: ['litvm', 'ecosystem', 'testnet', 'portal'],
    inscriptionId: 'OII00000000-demo',
    shardIndexId: 'OISltc00000000-demo',
    inscriptionTxid: '8e7045fdfc041122c36443f5709edb613494a75f760ec318de911555bb1bfb78i0',
    chain: 'litecoin',
  };

  it('normalizeShard maps real contract data (incl. searchTags) correctly', () => {
    const normalized: NormalizedShard = normalizeShard(mockRealPayload);

    expect(normalized.shardId).toBe(BigInt(1));
    expect(normalized.title).toBe('LitVM Ecosystem');
    expect(normalized.inscriptionTxid).toBe(mockRealPayload.inscriptionTxid);
    expect(normalized.chain).toBe('litecoin');

    // searchTags should come from the payload (no longer hardcoded empty)
    expect(normalized.browser?.searchTags).toEqual(['litvm', 'ecosystem', 'testnet', 'portal']);

    // web3 context should be derived
    expect(normalized.web3?.url).toBe('https://testnet.litvm.com');
    expect(normalized.browser?.defaultTab).toBe('web3');

    // on-chain metadata carried through
    expect(normalized.inscriptionId).toBe('OII00000000-demo');
    expect(normalized.shardIndexId).toBe('OISltc00000000-demo');
  });

  it('normalizeShard handles missing optional fields gracefully', () => {
    const minimal: ContractShard = {
      shardId: BigInt(42),
      title: 'Minimal Shard',
      web2Url: 'https://example.com',
      web2Description: '',
      web3Url: '',
      web3Description: '',
      browserDefaultTab: 'web2',
      web2Locked: false,
      web3Locked: false,
      searchTags: ['foo'],
      inscriptionId: '',
      shardIndexId: '',
      inscriptionTxid: '',
      chain: '',
    };

    const n = normalizeShard(minimal);
    expect(n.shardId).toBe(BigInt(42));
    expect(n.browser?.searchTags).toEqual(['foo']);
    expect(n.web2?.url).toBe('https://example.com');
  });

  // Basic shape test for what searchShardsOnChain would return after normalization
  it('searchShardsOnChain (via normalizer) would return array of properly shaped NormalizedShard', () => {
    // Simulate what the function does after a successful contract.search()
    const rawShards: ContractShard[] = [mockRealPayload, { ...mockRealPayload, shardId: BigInt(2), title: 'ZNS Connect', searchTags: ['zns', 'domain'] }];
    const normalized = rawShards.map(normalizeShard);

    expect(Array.isArray(normalized)).toBe(true);
    expect(normalized.length).toBe(2);
    expect(normalized[0].title).toBe('LitVM Ecosystem');
    expect(normalized[1].browser?.searchTags).toContain('zns');
    // key visibility fields present
    expect(normalized.every(s => 'shardId' in s && 'title' in s && 'inscriptionTxid' in s)).toBe(true);
  });
});
