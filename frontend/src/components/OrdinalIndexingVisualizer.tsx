import React, { useEffect, useState } from 'react';
import { Server, Send, CheckCircle, Clock, Search, FileSearch, List } from 'lucide-react';
import type { Shard } from './Web3Container'; // re-exported from types.ts via index.ts

interface OrdinalIndexingVisualizerProps {
  shard: Shard | null;
  // meta from the index JSON (new structure with inscriptionId, shard_index_id, inscriptionType, etc.)
  meta?: Record<string, any> | null;
  // New props to support search-triggered LitVM indexing flow (in addition to shard load)
  searchQuery?: string | null;
  indexingKey?: number; // bump to force-run the pipeline animation for a search
  onIndexingComplete?: () => void;
  // Control visibility of Ordinal Metadata: only show after search submitted and results returned
  hasSearchResults?: boolean;
}

interface Step {
  id: number;
  label: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // ms for animation
}

const STEPS: Step[] = [
  {
    id: 1,
    label: "User Submits Search",
    description: "User enters a value in the search bar (right pane) and submits the query to begin the indexing process.",
    icon: <Search className="w-5 h-5" />,
    duration: 500,
  },
  {
    id: 2,
    label: "Trigger LitVM Indexer Pipeline",
    description: "The submitted search triggers the LitVM Indexer Pipeline (EVM-compatible rollup).",
    icon: <Server className="w-5 h-5" />,
    duration: 700,
  },
  {
    id: 3,
    label: "Search & Process Litecoin Ordinals",
    description: "LitVM searches Litecoin Ordinals for inscriptions containing the search keywords / dual-index listings. Processes the found ordinals + search input to locate the exact ordinal and exact JSON item.",
    icon: <FileSearch className="w-5 h-5" />,
    duration: 1600,
  },
  {
    id: 4,
    label: "Return Indexed Results to Browser",
    description: "LitVM returns the indexed results back to the browser. Browser displays a clean search results list below the search bar (showing shard_id for each result).",
    icon: <List className="w-5 h-5" />,
    duration: 900,
  },
];

export default function OrdinalIndexingVisualizer({ 
  shard, 
  meta,
  searchQuery, 
  indexingKey, 
  onIndexingComplete,
  hasSearchResults = false
}: OrdinalIndexingVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [indexingCompleteCalled, setIndexingCompleteCalled] = useState(false);

  const envType = shard?.browser?.defaultTab || (shard?.web3 ? 'web3' : 'web2');

  // Trigger animation when shard changes (load / select specific shard)
  useEffect(() => {
    if (!shard) {
      // Do not fully reset here if a search indexing may be active
      if (!searchQuery) {
        setCurrentStep(0);
        setCompletedSteps([]);
      }
      return;
    }

    // Reset and start animation sequence for the loaded shard
    setCurrentStep(0);
    setCompletedSteps([]);
    setIndexingCompleteCalled(false);

    let step = 0;
    const timers: NodeJS.Timeout[] = [];

    const runStep = () => {
      if (step < STEPS.length) {
        setCurrentStep(step + 1);
        if (step > 0) {
          setCompletedSteps(prev => [...prev, step]);
        }

        const timer = setTimeout(() => {
          step++;
          if (step < STEPS.length) {
            runStep();
          } else {
            setCompletedSteps(prev => [...prev, STEPS.length]);
            setCurrentStep(STEPS.length + 1);
          }
        }, STEPS[step].duration);

        timers.push(timer);
      }
    };

    const startTimer = setTimeout(runStep, 300);
    timers.push(startTimer);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [shard?.shardId, shard?.title]); // re-run on shard identity change

  // Search / LitVM Indexer Pipeline trigger (new flow requirement)
  // When parent bumps indexingKey + provides searchQuery, run the 4-stage pipeline
  // to drive the real flow: submit search → trigger indexer → search/process ordinals → return results.
  useEffect(() => {
    if (!indexingKey || !searchQuery) return;

    setCurrentStep(0);
    setCompletedSteps([]);
    setIndexingCompleteCalled(false);

    let step = 0;
    const timers: NodeJS.Timeout[] = [];

    const runStep = () => {
      if (step < STEPS.length) {
        setCurrentStep(step + 1);
        if (step > 0) {
          setCompletedSteps(prev => [...prev, step]);
        }

        const timer = setTimeout(() => {
          step++;
          if (step < STEPS.length) {
            runStep();
          } else {
            setCompletedSteps(prev => [...prev, STEPS.length]);
            setCurrentStep(STEPS.length + 1);

            if (!indexingCompleteCalled) {
              setIndexingCompleteCalled(true);
              onIndexingComplete?.();
            }
          }
        }, STEPS[step].duration);

        timers.push(timer);
      }
    };

    const startTimer = setTimeout(runStep, 250);
    timers.push(startTimer);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [indexingKey, searchQuery]); // intentionally light deps; callback guarded by flag

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'complete';
    if (currentStep === stepId) return 'active';
    return 'pending';
  };

  return (
    <div className="w-80 border-r border-[#4A4A4A] bg-[#404040] flex flex-col h-full overflow-hidden text-sm text-[#DADADA]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#4A4A4A] bg-[#353535] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#56D3C3] flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#404040]">OI</span>
          </div>
          <div>
            <div className="font-semibold tracking-tight text-[#56D3C3]">Ordinal Indexing Visualizer</div>
            <div className="text-[10px] text-[#B9FFE8]">LitVM Dual-Index Reassembly</div>
          </div>
        </div>
      </div>

      {/* Ordinal Metadata block - only shown after a search has been submitted and results are returned.
          Before search: clean minimal placeholder. */}
      {hasSearchResults ? (
        <div className="px-4 py-2.5 border-b border-[#4A4A4A] bg-[#353535] flex-shrink-0 text-[11px] font-mono">
          <div className="text-[#B9FFE8] text-[10px] uppercase tracking-[1px] mb-1">Ordinal Metadata</div>
          <div className="space-y-[1px] text-[#DADADA]">
            {meta?.inscriptionId && <div><span className="text-[#56D3C3]">inscription:</span> {meta.inscriptionId}</div>}
            {(shard?.inscriptionTxid || (shard as any)?.inscriptionTxid) && <div><span className="text-[#56D3C3]">txn:</span> {(shard?.inscriptionTxid || (shard as any)?.inscriptionTxid)}</div>}
            {meta?.shard_index_id && <div><span className="text-[#56D3C3]">shard_index_id:</span> {meta.shard_index_id}</div>}
          </div>
          {shard && (
            <div className="mt-1.5 pt-1 border-t border-[#4A4A4A]/60 text-[10px] text-[#B9FFE8] space-y-[1px]">
              <div>shard_id: <span className="text-[#DADADA] font-mono">{String(shard.shardId ?? (shard as any).id)}</span></div>
              <div className="pt-0.5 text-[9px] text-[#56D3C3]/70">env: {envType}</div>
            </div>
          )}
          {!shard && searchQuery && (
            <div className="mt-1 text-[10px] text-[#56D3C3]">query: <span className="text-[#DADADA]">{searchQuery}</span></div>
          )}
        </div>
      ) : (
        <div className="px-4 py-2.5 border-b border-[#4A4A4A] bg-[#353535] flex-shrink-0 text-[11px] text-[#DADADA]/70">
          Submit a search from the bar on the right to begin indexing.
        </div>
      )}

      {/* Selected / Loaded Shard Info (kept + lightly enhanced) */}
      <div className="px-4 py-3 border-b border-[#4A4A4A] bg-[#353535] flex-shrink-0">
        {shard ? (
          <div>
            <div className="text-[10px] uppercase tracking-[1px] text-[#56D3C3] font-medium mb-0.5">Loaded Shard</div>
            <div className="font-semibold text-base leading-tight text-[#B9FFE8]">{shard.title}</div>
            <div className="text-[10px] text-[#DADADA] mt-0.5 flex items-center gap-2">
              <span>{shard.chain}</span>
            </div>
            {shard.snippet && (
              <div className="text-[11px] text-[#DADADA]/80 mt-1.5 line-clamp-2">
                {shard.snippet}
              </div>
            )}
          </div>
        ) : (
          <div className="text-[#DADADA] text-xs">Submit a search from the bar on the right to trigger the full flow: LitVM searches Ordinals for dual-index items → returns JSON results list (with shard_id) → click to load shard (web2/web3).</div>
        )}
      </div>

      {/* Steps */}
      <div className="flex-1 p-4 overflow-auto min-h-0">
        <div className="text-[10px] uppercase tracking-[1px] text-[#B9FFE8]/80 mb-3 px-1">Search → LitVM Indexer → Browser Delivery (4-stage flow)</div>

        <div className="space-y-3">
          {STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const isLast = index === STEPS.length - 1;

            return (
              <div key={step.id} className="relative pl-8">
                {/* Vertical line */}
                {!isLast && (
                  <div className={`absolute left-[15px] top-7 bottom-0 w-px ${status === 'complete' ? 'bg-[#56D3C3]/50' : 'bg-[#4A4A4A]'}`} />
                )}

                <div className="flex items-start gap-3">
                  {/* Step indicator */}
                  <div
                    className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-mono transition-all ${
                      status === 'complete'
                        ? 'border-[#56D3C3] bg-[#353535] text-[#56D3C3]'
                        : status === 'active'
                        ? 'border-[#56D3C3] bg-[#4A4A4A] text-[#56D3C3] animate-pulse'
                        : 'border-[#4A4A4A] bg-[#353535] text-[#DADADA]'
                    }`}
                  >
                    {status === 'complete' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>

                  <div className="flex-1 pt-0.5">
                    <div
                      className={`font-medium text-sm transition-colors ${
                        status === 'active' ? 'text-[#56D3C3]' : status === 'complete' ? 'text-[#B9FFE8]' : 'text-[#DADADA]'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-[11px] text-[#DADADA]/80 mt-0.5 leading-snug">
                      {step.description}
                    </div>

                    {/* Status line for active step */}
                    {status === 'active' && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#56D3C3]/80">
                        <Clock className="w-3 h-3" />
                        <span>Processing...</span>
                        <div className="flex-1 h-px bg-[#56D3C3]/30" />
                      </div>
                    )}
                    {status === 'complete' && (
                      <div className="mt-1 text-[10px] text-[#B9FFE8]/80 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Complete
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final delivery callout */}
        {currentStep > STEPS.length && shard && (
          <div className="mt-5 rounded-lg border border-[#56D3C3]/40 bg-[#353535] p-3 text-xs text-[#DADADA]">
            <div className="font-medium text-[#56D3C3] flex items-center gap-1.5 mb-1">
              <Send className="w-3.5 h-3.5" /> Shard Loaded in Browser
            </div>
            <div className="text-[#DADADA]/80 leading-snug">
              Results list was shown (with shard_id). {shard.title} now active (Web2/Web3 per JSON config).
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 py-2 border-t border-[#4A4A4A] bg-[#353535] text-[10px] text-[#DADADA]/70 flex-shrink-0">
        Real flow: 1. Submit search → 2. Trigger LitVM Indexer → 3. Search/process Litecoin Ordinals (keywords + dual-index JSON) → 4. Return results list.
      </div>
    </div>
  );
}
