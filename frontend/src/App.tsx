import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import type { Shard } from './components/Web3Container';
import ShardEnvironment from './components/ShardEnvironment';
import { loadOrdinalIndex } from './pages/SearchPage';
import OrdinalIndexingVisualizer from './components/OrdinalIndexingVisualizer';
import { searchShardsOnChain } from './services/contractService';

/**
 * App
 *
 * Correct demo flow (as specified):
 * 1. User enters a value in the search bar (right pane) and submits ("Index & Search").
 * 2. Submit triggers the simulated LitVM Contract Indexer.
 * 3. Left Ordinal Indexing Visualizer runs the 4-stage pipeline in real time.
 * 4. On completion, the browser (right pane) receives indexed results and shows a clean list below the search bar.
 *    Each result displays Title, description, and shard_id.
 * 5. Clicking a result loads the shard into the main browser view (ShardEnvironment with Web2/Web3 tabs).
 *
 * The left visualizer always shows enhanced ordinal metadata (inscription, txn, shard_index_id)
 * plus shard_id + env type when a shard is loaded. The top nav has a centered (demo) address bar.
 *
 * Layout is always a split: left technical visualizer (grey + #56D3C3 theme) | right browser content.
 */
function App() {
  const [selectedShard, setSelectedShard] = useState<Shard | null>(null);

  // Search flow state (drives visualizer + results list)
  const [searchInput, setSearchInput] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [results, setResults] = useState<Shard[]>([]);
  const [indexingKey, setIndexingKey] = useState(0);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isLiveData, setIsLiveData] = useState(false);

  // Simple debug mode: append ?debug=1 to URL to show raw contract data in the UI
  const debugMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  useEffect(() => {
    if (debugMode) {
      console.log('[App] DEBUG MODE ENABLED (?debug=1) — extra raw contract data visible in results UI + detailed [contractService] logs in console.');
    }
  }, [debugMode]);

  // Load full index (meta + shards) to support new meta fields like shard_index_id, etc.
  const { meta, shards: allShards } = useMemo(() => loadOrdinalIndex(), []);

  const currentAddress = selectedShard
    ? `ordnet://${selectedShard.title.toLowerCase().replace(/\s+/g, '-')}/${selectedShard.browser?.defaultTab || 'web2'}`
    : currentQuery
      ? `search://${currentQuery.toLowerCase().replace(/\s+/g, '-')}`
      : 'ordnet://index';

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;

    setCurrentQuery(q);
    setResults([]);
    setIsIndexing(true);
    setIsLiveData(false);

    // Bump key → tells the visualizer to start the LitVM indexing pipeline animation
    setIndexingKey(Date.now());
  };

  const handleIndexingComplete = async () => {
    setIsIndexing(false);

    const q = currentQuery.toLowerCase().trim();
    console.log('[App] handleIndexingComplete triggered for query:', q);

    // Prioritize live contract data (searchShardsOnChain is the primary flow).
    // We only fall back to local/demo data if the contract call *explicitly fails* (throws).
    // If the contract succeeds (even with 0 results), we trust it as the source of truth.
    try {
      const onChainResults = await searchShardsOnChain(q);
      const liveCount = onChainResults ? onChainResults.length : 0;

      console.log('[App] LIVE CONTRACT path succeeded (primary).', {
        query: q,
        count: liveCount,
        isLiveData: true,
        usingLive: true,
        note: liveCount === 0 ? 'Contract returned 0 matches for this query (no fallback)' : 'Live results used',
        sample: onChainResults && onChainResults[0] ? {
          shardId: onChainResults[0].shardId,
          title: onChainResults[0].title,
          inscriptionTxid: onChainResults[0].inscriptionTxid,
          searchTags: onChainResults[0].browser?.searchTags,
          chain: onChainResults[0].chain,
          web2Locked: onChainResults[0].browser?.web2Locked,
          web3Locked: onChainResults[0].browser?.web3Locked,
        } : null,
      });

      setResults((onChainResults || []) as Shard[]);
      setIsLiveData(true);
      return;  // Live data (0 or more) wins
    } catch (err) {
      console.warn('[App] Live contract search EXPLICITLY FAILED — falling back to local demo data:', err);
    }

    // Graceful fallback ONLY on contract failure
    const filtered = allShards.filter((shard) => {
      const tags = (shard.browser?.searchTags || []).map((t) => t.toLowerCase());
      const title = shard.title.toLowerCase();
      const snippet = (shard.snippet || '').toLowerCase();
      return (
        tags.some((tag) => tag.includes(q)) ||
        title.includes(q) ||
        snippet.includes(q)
      );
    });

    const finalResults = filtered.length > 0 ? filtered : allShards;
    console.log('[App] FALLBACK LOCAL DATA used (because live contract call failed):', {
      count: finalResults.length,
      isLive: false,
      query: q,
    });
    setResults(finalResults);
    setIsLiveData(false);
  };

  const handleSelectResult = (shard: Shard) => {
    setSelectedShard(shard);
  };

  const handleBackToSearch = () => {
    setSelectedShard(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header currentAddress={currentAddress} />

      <main className="flex-1 h-full flex flex-col overflow-hidden">
        <div className="flex h-full">
          {/* Left: Ordinal Indexing Visualizer */}
          <OrdinalIndexingVisualizer
            shard={selectedShard}
            meta={meta}
            searchQuery={currentQuery || null}
            indexingKey={indexingKey || undefined}
            onIndexingComplete={handleIndexingComplete}
            hasSearchResults={results.length > 0}
          />

          {/* Right: Browser content area */}
          <div className="flex-1 min-w-0 border-l border-border flex flex-col overflow-hidden bg-background">
            {!selectedShard ? (
              /* Search + Results */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-surface/30 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <Search size={15} className="text-textSecondary" />
                    <span className="font-medium">Search Sharded Index</span>
                    <span className="ml-auto text-[10px] text-textSecondary/60">Triggers LitVM indexer → left visualizer</span>
                  </div>

                  <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search shards (e.g. litecoin, zns, defi, ordinals...)"
                      className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm text-text placeholder:text-textSecondary focus:outline-none focus:border-primary/50"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 text-sm font-medium rounded bg-primary text-white hover:bg-primary/90 active:scale-[0.985] transition"
                    >
                      Index &amp; Search
                    </button>
                  </form>

                  {currentQuery && (
                    <div className="mt-1.5 text-[10px] text-textSecondary/80">
                      Query: <span className="font-mono text-[#56D3C3]">{currentQuery}</span>
                      {isIndexing ? '  •  LitVM Contract Indexer running (see left)...' : `  •  ${results.length} results received`}
                    </div>
                  )}
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-auto p-3 space-y-2 text-sm">
                  {isIndexing ? (
                    <div className="h-full flex items-center justify-center text-center">
                      <div className="text-[#56D3C3] text-xs">
                        Simulating LitVM Contract Indexer...<br />
                        Watch the 4-stage pipeline animate on the left panel.
                      </div>
                    </div>
                  ) : results.length > 0 ? (
                    <>
                      {isLiveData && (
                        <div className="mb-2 text-[10px] px-2 py-0.5 rounded bg-[#56D3C3]/10 text-[#56D3C3] border border-[#56D3C3]/30 inline-flex items-center gap-1">
                          On-chain • LitVM Testnet
                        </div>
                      )}

                      {debugMode && results.length > 0 && (
                        <details className="mb-2 text-[10px] bg-black/40 border border-[#56D3C3]/30 rounded p-1">
                          <summary className="cursor-pointer font-mono text-[#56D3C3]/80 select-none">
                            DEBUG: raw contract data ({results.length} items) — click to expand
                          </summary>
                          <pre className="mt-1 p-2 text-[9px] bg-black/60 overflow-auto max-h-[180px] text-[#B9FFE8] border-t border-[#56D3C3]/20">
                            {JSON.stringify(results, (_k, v) => (typeof v === 'bigint' ? v.toString() : v), 2)}
                          </pre>
                          <div className="text-[9px] text-textSecondary/60 mt-1">Tip: also check browser console for detailed [contractService] logs.</div>
                        </details>
                      )}

                      {results.map((shard) => {
                        // Fixed context logic per requirements:
                        // Show "web2 context" ONLY if has web2Url AND web2Locked is false.
                        // Show "web3 context" ONLY if has web3Url AND web3Locked is false.
                        const hasWeb2 = !!(shard.web2?.url || shard.url);
                        const hasWeb3 = !!shard.web3?.url;
                        const web2Locked = shard.browser?.web2Locked === true;
                        const web3Locked = shard.browser?.web3Locked === true;

                        const showWeb2 = hasWeb2 && !web2Locked;
                        const showWeb3 = hasWeb3 && !web3Locked;

                        let contextLabel = 'no context';
                        if (showWeb2 && showWeb3) contextLabel = 'web2 / web3';
                        else if (showWeb3) contextLabel = 'web3';
                        else if (showWeb2) contextLabel = 'web2';

                        return (
                          <button
                            key={String(shard.shardId)}
                            onClick={() => handleSelectResult(shard)}
                            className="w-full text-left p-3 bg-surface border border-border hover:border-[#56D3C3]/60 hover:bg-[#353535] rounded-lg transition-colors group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-semibold text-text group-hover:text-[#56D3C3] transition-colors">
                                {shard.title}
                              </div>
                              <div className="shrink-0 px-1.5 py-0.5 rounded bg-[#4A4A4A] text-[#DADADA] text-[10px] font-mono">
                                shard_id: {String(shard.shardId)}
                              </div>
                            </div>

                            <p className="text-xs text-[#DADADA]/80 mt-1 line-clamp-2">
                              {shard.snippet}
                            </p>

                            <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#B9FFE8]/80">
                              <span>{shard.chain}</span>
                              <span className="text-[#4A4A4A]">•</span>
                              <span>{contextLabel} context</span>
                            </div>

                            {/* Show searchTags for live results to make it clear why the shard matched the query (tags-driven search) */}
                            {shard.browser?.searchTags && shard.browser.searchTags.length > 0 && (
                              <div className="mt-1 text-[9px] text-[#B9FFE8]/60 truncate">
                                tags: {shard.browser.searchTags.join(', ')}
                              </div>
                            )}
                            {shard.inscriptionTxid && (
                              <div className="text-[9px] text-[#B9FFE8]/50 truncate">tx: {String(shard.inscriptionTxid).slice(0, 16)}…</div>
                            )}
                          </button>
                        );
                      })}
                    </>
                  ) : currentQuery ? (
                    <div className="text-xs text-textSecondary p-6 text-center">
                      {isLiveData 
                        ? 'Live contract search returned no matches for this query (on-chain data has no shards whose searchTags or title matched).'
                        : 'No shards matched after indexing. Try “litecoin”, “zns”, “defi”, or “ordinals”.'}
                    </div>
                  ) : (
                    <div className="text-xs text-textSecondary p-6">
                      Enter a search term above and click <span className="font-medium text-text">“Index &amp; Search”</span> to trigger the full
                      Ordinal → LitVM indexing pipeline.
                    </div>
                  )}
                </div>

                <div className="px-3 py-1 text-[10px] text-center text-textSecondary/60 border-t border-border flex-shrink-0">
                  Results delivered from simulated LitVM dual-index reassembly • Click any card to load into browser view
                </div>
              </div>
            ) : (
              /* Loaded shard environment */
              <ShardEnvironment
                shard={selectedShard}
                onBack={handleBackToSearch}
                isLiveData={isLiveData}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;