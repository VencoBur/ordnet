import { ExternalLink, Eye, Loader2 } from 'lucide-react';
import { Shard } from '../types';
import { LITVM_EXPLORER, LITECOIN_ORDINAL_EXPLORER } from '../config/contract';

interface SearchResultsProps {
  results: Shard[];
  loading: boolean;
  onPreview: ((shard: Shard) => void) | null;
  onChainView?: boolean;
}

export default function SearchResults({ results, loading, onPreview, onChainView = false }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={40} className="text-primary animate-spin mb-4" />
        <p className="text-textSecondary">Loading shards...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" className="text-textSecondary">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-text mb-2">No results found</h3>
        <p className="text-textSecondary">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-textSecondary">
          Found <span className="text-text font-semibold">{results.length}</span> result{results.length !== 1 ? 's' : ''}
        </p>
        {onChainView && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-lg">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-primary">Live from Chain</span>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {results.map((shard) => (
          <div
            key={shard.shardId.toString()}
            className="p-6 bg-surface border border-border rounded-xl hover:border-primary/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors">
                  {shard.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs font-medium">
                    {shard.chain}
                  </span>
                  <span className="text-textSecondary text-xs font-mono">
                    ID: {shard.shardId.toString()}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-text leading-relaxed mb-4">
              {shard.snippet}
            </p>

            <div className="flex flex-wrap gap-2">
              <a
                href={shard.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-opacity-90 text-text rounded-lg transition-all text-sm font-medium"
              >
                <ExternalLink size={16} />
                <span>View on Web</span>
              </a>

              {onPreview && (
                <button
                  onClick={() => onPreview(shard)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-background hover:bg-opacity-80 border border-border text-text rounded-lg transition-all text-sm font-medium"
                >
                  <Eye size={16} />
                  <span>Sandbox Preview</span>
                </button>
              )}

              {onChainView && (
                <>
                  <a
                    href={`${LITECOIN_ORDINAL_EXPLORER}/${shard.inscriptionTxid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-background hover:bg-opacity-80 border border-border text-textSecondary hover:text-text rounded-lg transition-all text-sm"
                  >
                    <ExternalLink size={16} />
                    <span>Litecoin Ordinal</span>
                  </a>
                  <a
                    href={`${LITVM_EXPLORER}/tx/${shard.inscriptionTxid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-background hover:bg-opacity-80 border border-border text-textSecondary hover:text-text rounded-lg transition-all text-sm"
                  >
                    <ExternalLink size={16} />
                    <span>LitVM Explorer</span>
                  </a>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
