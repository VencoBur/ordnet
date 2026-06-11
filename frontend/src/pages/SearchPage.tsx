import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { Shard } from '../components/Web3Container';

// Raw import lets us load the commented JSON file and strip the header comment at runtime.
import demoIndexRaw from '../data/demo-ordinal-index.json?raw';

/**
 * SearchPage
 *
 * Main discovery experience.
 * - Loads shards from the temporary demo-ordinal-index.json (via ?raw + comment stripping)
 * - Filters primarily on searchTags (case-insensitive) + also title and snippet for good UX.
 * - Renders a clean responsive grid of result cards.
 * - Clicking a card calls onSelectShard so the parent App can switch to ShardViewer.
 *
 * This replaces the previous hardcoded demos and old Web2Browser/SearchResults.
 */
interface SearchPageProps {
  onSelectShard: (shard: Shard) => void;
}

export interface OrdinalIndexData {
  meta: Record<string, any>;
  shards: Shard[];
}

export function loadOrdinalIndex(): OrdinalIndexData {
  try {
    // Remove the leading /* ... */ block so the rest is valid JSON.
    const jsonText = demoIndexRaw.replace(/\/\*[\s\S]*?\*\//, '').trim();
    const parsed = JSON.parse(jsonText);

    // Support both old flat array format and the new { meta, shards } format
    let rawShards: any[] = [];
    let meta: Record<string, any> = {};
    if (Array.isArray(parsed)) {
      rawShards = parsed;
    } else if (parsed && Array.isArray(parsed.shards)) {
      rawShards = parsed.shards;
      meta = parsed.meta || {};
    }

    // Normalize the exact new JSON structure (web2/web3 can be null, browser has minimal fields, searchTags at root)
    const normalizedShards = rawShards.map((s: any): Shard => {
      const web2 = s.web2 || null;
      const web3 = s.web3 || null;
      const browser = s.browser || {};

      // Derive snippet from the description in the active web* object
      const snippet =
        (web2 && web2.description) ||
        (web3 && web3.description) ||
        '';

      // Derive chain for display (Litecoin for pure web2, LitVM for the others)
      const chain = web2 && !web3 ? 'Litecoin' : 'LitVM';

      return {
        shardId: String(s.id ?? s.shardId ?? 0),
        title: s.title || 'Untitled Shard',
        snippet,
        url: (web2 && web2.url) || (web3 && web3.url) || '',
        web2: web2 && web2.url ? { url: web2.url, label: s.title } : undefined,
        web3: web3 && web3.url ? { url: web3.url, label: s.title } : undefined,
        inscriptionTxid: s.inscriptionTxid || '',
        merkleProof: s.merkleProof || '',
        chain,
        browser: {
          defaultTab: browser.defaultTab || (web3 ? 'web3' : 'web2'),
          web2Locked: browser.web2Locked ?? (web2 == null),
          web3Locked: browser.web3Locked ?? (web3 == null),
          searchTags: s.searchTags || [],
        },
      };
    });

    return { meta, shards: normalizedShards };
  } catch (err) {
    console.error('Failed to parse demo-ordinal-index.json', err);
    return { meta: {}, shards: [] };
  }
}

// Backward-compatible export for existing callers
export function loadDemoShards(): Shard[] {
  return loadOrdinalIndex().shards;
}

export default function SearchPage({ onSelectShard }: SearchPageProps) {
  const [query, setQuery] = useState('');

  // Load once (static demo data)
  const allShards = useMemo(() => loadDemoShards(), []);

  // Filter shards using searchTags (as specified) + title/snippet fallback
  const filteredShards = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allShards;

    return allShards.filter((shard) => {
      const tags = (shard.browser?.searchTags || []).map((t) => t.toLowerCase());
      const title = shard.title.toLowerCase();
      const snippet = (shard.snippet || '').toLowerCase();

      return (
        tags.some((tag) => tag.includes(q)) ||
        title.includes(q) ||
        snippet.includes(q)
      );
    });
  }, [query, allShards]);

  return (
    <div className="w-full">
      {/* Hero / Search Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text mb-3">
          OrdNET
        </h1>
        <p className="text-textSecondary text-lg max-w-md mx-auto">
          Search the sharded web • Web2 + Web3 in one place
        </p>
        <p className="mt-1 text-[11px] text-textSecondary/60 font-mono">
          Using temporary demo data (src/data/demo-ordinal-index.json) — {allShards.length} shards loaded
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by tag, title, or description (e.g. litecoin, defi, ordinals)..."
            className="w-full pl-14 pr-6 py-4 bg-surface border border-border rounded-2xl text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/40 text-lg transition-all"
          />
        </div>
        <div className="mt-2 text-xs text-textSecondary text-center">
          Filters on searchTags + title + snippet • {filteredShards.length} result{filteredShards.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Results Grid */}
      {filteredShards.length === 0 ? (
        <div className="text-center py-12 text-textSecondary">
          No shards match your search.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {filteredShards.map((shard) => {
            const tags = shard.browser?.searchTags || [];
            const isWeb3Default = shard.browser?.defaultTab === 'web3';
            const hasWeb2 = !!shard.web2;

            return (
              <button
                key={String(shard.shardId)}
                onClick={() => onSelectShard(shard)}
                className="group text-left p-5 bg-surface border border-border rounded-2xl hover:border-primary/50 hover:bg-[#16161c] transition-all flex flex-col h-full"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-text group-hover:text-primary transition-colors">
                      {shard.title}
                    </h3>
                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-mono rounded bg-border/70 text-textSecondary">
                      {shard.chain}
                    </span>
                  </div>

                  <p className="text-sm text-textSecondary line-clamp-3 mb-3">
                    {shard.snippet}
                  </p>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tags.slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] rounded-full bg-border/50 text-textSecondary font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-textSecondary">
                  <span>
                    {hasWeb2 ? 'Web2 + ' : ''}Web3
                    {isWeb3Default && ' (Web3 default)'}
                  </span>
                  <span className="text-primary group-hover:underline">View →</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Hint */}
      <div className="mt-10 text-center text-xs text-textSecondary/70 max-w-xs mx-auto">
        Click any card to open the dual Web2 / Web3 viewer for that shard.
      </div>
    </div>
  );
}
