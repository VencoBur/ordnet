import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Database, Search, Plus, ExternalLink, Loader2 } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import SearchResults from './SearchResults';
import { LITVM_EXPLORER, LITECOIN_ORDINAL_EXPLORER } from '../config/contract';

export default function Web3OnChain() {
  const { isConnected } = useAccount();
  const { shards, loading, searchShards, loadAllShards, addShard, isOwner } = useContract();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    snippet: '',
    url: '',
    inscriptionTxid: '',
    merkleProof: '',
    chain: ''
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchShards(searchQuery);
    } else {
      await loadAllShards();
    }
  };

  const handleAddShard = async (e: React.FormEvent) => {
    e.preventDefault();
    await addShard(formData);
    setShowAddForm(false);
    setFormData({ title: '', snippet: '', url: '', inscriptionTxid: '', merkleProof: '', chain: '' });
    await loadAllShards();
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6">
          <Database size={40} className="text-text" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-text mb-4 tracking-tight">
          Connect to LitVM
        </h2>
        <p className="text-textSecondary text-lg mb-8 max-w-md">
          Access live on-chain data directly from the OrdinalReassembler smart contract
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-text mb-3 tracking-tight">
          Web3 On-Chain
        </h2>
        <p className="text-textSecondary text-lg">
          Live smart contract data from LitVM testnet
        </p>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={loadAllShards}
          disabled={loading}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-primary hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-text font-medium rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary/20"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Loading from Chain...</span>
            </>
          ) : (
            <>
              <Database size={20} />
              <span>Load Live Shards from Chain</span>
            </>
          )}
        </button>

        {isOwner && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-surface hover:bg-opacity-80 border border-border text-text font-medium rounded-xl transition-all"
          >
            <Plus size={20} />
            <span>Add Demo Shard (Owner)</span>
          </button>
        )}
      </div>

      {/* Add Form (Owner Only) */}
      {showAddForm && isOwner && (
        <div className="mb-8 p-6 bg-surface border border-border rounded-xl">
          <h3 className="text-xl font-bold text-text mb-4">Add New Shard</h3>
          <form onSubmit={handleAddShard} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="text"
                placeholder="Chain (e.g., Litecoin)"
                value={formData.chain}
                onChange={(e) => setFormData({ ...formData, chain: e.target.value })}
                className="px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <textarea
              placeholder="Snippet"
              value={formData.snippet}
              onChange={(e) => setFormData({ ...formData, snippet: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              required
            />
            <input
              type="url"
              placeholder="URL"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Inscription Txid"
                value={formData.inscriptionTxid}
                onChange={(e) => setFormData({ ...formData, inscriptionTxid: e.target.value })}
                className="px-4 py-3 bg-background border border-border rounded-lg text-text font-mono placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="text"
                placeholder="Merkle Proof (0x...)"
                value={formData.merkleProof}
                onChange={(e) => setFormData({ ...formData, merkleProof: e.target.value })}
                className="px-4 py-3 bg-background border border-border rounded-lg text-text font-mono placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary hover:bg-opacity-90 text-text font-medium rounded-xl transition-all"
            >
              Add Shard to Contract
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search on-chain shards..."
            className="w-full pl-14 pr-6 py-4 bg-surface border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-6 py-3 bg-primary hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-text font-medium rounded-xl transition-all mx-auto block"
        >
          Search Contract
        </button>
      </form>

      {/* Results */}
      <SearchResults
        results={shards}
        loading={loading}
        onPreview={null}
        onChainView
      />

      {/* On-Chain Data Info */}
      {shards.length > 0 && (
        <div className="mt-8 p-6 bg-surface border border-border rounded-xl">
          <h3 className="text-lg font-bold text-text mb-3">On-Chain Data Source</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">Network:</span>
              <span className="text-text font-medium">LitVM Testnet (Chain ID 4441)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">Total Shards:</span>
              <span className="text-text font-medium">{shards.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">Explorer:</span>
              <a
                href={LITVM_EXPLORER}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:text-opacity-80 transition-colors"
              >
                <span>View Contract</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
