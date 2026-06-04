import { useState } from 'react';
import { Search, ExternalLink, Eye } from 'lucide-react';
import SearchResults from './SearchResults';
import { Shard } from '../types';

// Mock Web2 search data (client-side filtering)
const mockShards: Shard[] = [
  {
    shardId: BigInt(1),
    title: 'Litecoin Official Documentation',
    snippet: 'Comprehensive guide to Litecoin protocol, mining, and integration. Built on Scrypt PoW with 2.5 minute blocks.',
    url: 'https://litecoin.org/en/resources',
    inscriptionTxid: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    merkleProof: '0x1234567890abcdef',
    chain: 'Litecoin'
  },
  {
    shardId: BigInt(2),
    title: 'Ordinals Theory Handbook',
    snippet: 'Complete guide to ordinal theory, inscription methods, and satoshi tracking on Bitcoin and Litecoin.',
    url: 'https://docs.ordinals.com',
    inscriptionTxid: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    merkleProof: '0x2345678901bcdef0',
    chain: 'Bitcoin'
  },
  {
    shardId: BigInt(3),
    title: 'LitVM Technical Specification',
    snippet: 'Layer-2 EVM execution environment on Litecoin. Deploy Solidity contracts with zkLTC gas token.',
    url: 'https://litvm.io/docs',
    inscriptionTxid: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    merkleProof: '0x3456789012cdef01',
    chain: 'LitVM'
  },
  {
    shardId: BigInt(4),
    title: 'The Web4 Manifesto',
    snippet: 'Seamless integration of Web2 UX with Web3 data integrity. One interface, universal access, cryptographic guarantees.',
    url: 'https://web4.foundation/manifesto',
    inscriptionTxid: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    merkleProof: '0x456789013def0123',
    chain: 'Litecoin'
  },
  {
    shardId: BigInt(5),
    title: 'Permanent Storage on Bitcoin & Litecoin',
    snippet: 'How ordinal inscriptions enable immutable, censorship-resistant data storage on proof-of-work blockchains.',
    url: 'https://ordinals.storage/guide',
    inscriptionTxid: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    merkleProof: '0x56789014ef012345',
    chain: 'Bitcoin'
  }
];

export default function Web2Browser() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Shard[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [previewShard, setPreviewShard] = useState<Shard | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);

    if (!query.trim()) {
      setResults(mockShards);
      return;
    }

    const filtered = mockShards.filter(shard =>
      shard.title.toLowerCase().includes(query.toLowerCase()) ||
      shard.snippet.toLowerCase().includes(query.toLowerCase()) ||
      shard.chain.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
  };

  return (
    <div className="w-full">
      {/* Search Section */}
      <div className={`flex flex-col items-center justify-center ${hasSearched ? 'mb-8' : 'min-h-[60vh]'} transition-all duration-500`}>
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-3 tracking-tight">
            Web2 Browser
          </h2>
          <p className="text-textSecondary text-lg">
            Classic search interface with Ordinal-backed results
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-3xl">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Web2 + Web3 knowledge..."
              className="w-full pl-14 pr-6 py-5 bg-surface border border-border rounded-2xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg transition-all"
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-8 py-3 bg-primary hover:bg-opacity-90 text-text font-medium rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary/20 mx-auto block"
          >
            Search OrdNET
          </button>
        </form>

        {!hasSearched && (
          <div className="mt-12 flex flex-wrap gap-3 justify-center">
            {['Litecoin', 'Ordinals', 'Web4', 'LitVM', 'Storage'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  setHasSearched(true);
                  const filtered = mockShards.filter(s =>
                    s.title.toLowerCase().includes(term.toLowerCase()) ||
                    s.snippet.toLowerCase().includes(term.toLowerCase()) ||
                    s.chain.toLowerCase().includes(term.toLowerCase())
                  );
                  setResults(filtered);
                }}
                className="px-4 py-2 bg-surface hover:bg-opacity-80 border border-border rounded-lg text-textSecondary hover:text-text transition-all text-sm"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Section */}
      {hasSearched && (
        <SearchResults
          results={results}
          loading={false}
          onPreview={setPreviewShard}
        />
      )}

      {/* Preview Modal */}
      {previewShard && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewShard(null)}
        >
          <div
            className="bg-surface border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-text mb-2">{previewShard.title}</h3>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm font-medium">
                    {previewShard.chain}
                  </span>
                  <span className="text-textSecondary text-sm font-mono">
                    ID: {previewShard.shardId.toString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewShard(null)}
                className="text-textSecondary hover:text-text transition-colors"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-text text-lg leading-relaxed mb-4">{previewShard.snippet}</p>
                <a
                  href={previewShard.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-opacity-80 transition-colors"
                >
                  <ExternalLink size={18} />
                  <span>Visit {previewShard.url}</span>
                </a>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-textSecondary mb-2">Inscription Metadata</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Txid:</span>
                    <span className="text-text font-mono">{previewShard.inscriptionTxid.slice(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Merkle Proof:</span>
                    <span className="text-text font-mono">{previewShard.merkleProof}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => window.open(previewShard.url, '_blank')}
                className="w-full mt-4 px-6 py-3 bg-primary hover:bg-opacity-90 text-text font-medium rounded-xl transition-all"
              >
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
