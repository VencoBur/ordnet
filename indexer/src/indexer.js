/**
 * OrdNET Off-Chain Indexer
 *
 * Purpose:
 * - Fetches live Ordinal inscription content (the dual-index JSON) from ordliteverse.com (or any ord server).
 * - Parses the `meta` section (inscriptionId, shard_index_id, inscriptionType, chain, project, etc.).
 * - Parses the `shards` array.
 * - Associates shards with their parent ordinal's metadata.
 * - Prepares data model for future on-chain submission to OrdinalReassembler contract on LitVM.
 * - Supports transaction/auditing fields (inscriptionTxid, etc.) for future use.
 * - Designed to be extensible to multiple ordinals.
 *
 * Phase 1 / Live mode:
 * - Single (or multiple via env) ordinal inscription ID(s).
 * - Periodic polling with setInterval (re-syncs and submits to chain).
 * - Logs the indexed data + on-chain submission status.
 * - Real contract interaction: uses batchAddShards on the deployed OrdinalReassemblerV2.
 *
 * Future / Extensibility:
 * - Multi-ordinal support is already built-in (just add more IDs to ORDINAL_INSCRIPTION_IDS).
 * - Additional tx fields (inscriptionTxid) are already in the data model.
 * - Persistence, better verification, listening to new inscriptions, etc. can be added easily.
 *
 * Data Model (extensible):
 *   IndexedOrdinal = {
 *     inscriptionTxid: string,         // the ordinal inscription tx ID (top level, before metadata)
 *     metadata: { ...full meta object from JSON (contains internal inscriptionId, shard_index_id, etc.) ... },
 *     shards: [ { id, title, web2, web3, browser, searchTags, ... } ],
 *     lastSynced: Date,
 *     // ... other future tx/ordinal fields (merkleProof removed)
 *   }
 */

require('dotenv').config();

const https = require('https');
const { ethers } = require('ethers');

// Minimal ABI for the functions we need from OrdinalReassemblerV2.
// The Shard struct is encoded as a tuple in the exact order defined in the contract.
const ORDINAl_REASSEMBLER_V2_ABI = [
  // batchAddShards(Shard[] newShards)
  "function batchAddShards(tuple(uint256 shardId, string title, string snippet, string web2Url, string web2Description, string web3Url, string web3Description, string browserDefaultTab, bool web2Locked, bool web3Locked, string inscriptionId, string shardIndexId, string inscriptionTxid, string merkleProof, string chain)[] newShards) external",
  // Optional: we could add owner() or other view funcs if needed for checks
];

// ====================== CONFIG ======================
const ORDINAL_BASE_URL = 'https://ordliteverse.com/content'; // or any ord server that serves raw content

// Comma-separated list of inscription IDs (the part after /content/)
const INSCRIPTION_IDS = (process.env.ORDINAL_INSCRIPTION_IDS || 
  '8e7045fdfc041122c36443f5709edb613494a75f760ec318de911555bb1bfb78i0')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

const SYNC_INTERVAL_MS = parseInt(process.env.SYNC_INTERVAL_MS || '300000', 10); // default 5 min

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();

// Ethers / contract config for LitVM LiteForge testnet (Chain ID 4441)
// Deployed OrdinalReassemblerV2: 0x5F794363553884E9AeaD019Fb436C7a2c1634578
// Supports LITVM_RPC_URL (preferred) or RPC_URL fallback.
const RPC_URL = process.env.LITVM_RPC_URL || process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ====================== DATA MODEL ======================
/**
 * Represents a fully indexed ordinal (one inscription containing meta + shards).
 * This model is designed to scale to many ordinals.
 */
class IndexedOrdinal {
  constructor(inscriptionId, metadata, shards, options = {}) {
    // inscriptionTxid (the full ordinal ID like ...i0) is set at the top level,
    // before metadata, for easy access by the verify script and contract prep.
    this.inscriptionTxid = inscriptionId; // the param is the txid-style identifier
    // Note: no top-level this.inscriptionId here anymore (duplicate removed; metadata has its own)
    this.metadata = metadata || {};           // full meta object preserved
    this.shards = Array.isArray(shards) ? shards : [];
    this.lastSynced = new Date();
    // Future fields can be added here without breaking existing code (merkleProof removed)
  }

  /**
   * Returns a plain object suitable for logging, storage, or contract submission.
   */
  toJSON() {
    return {
      inscriptionTxid: this.inscriptionTxid,
      metadata: this.metadata,
      shards: this.shards,
      lastSynced: this.lastSynced.toISOString(),
      shardCount: this.shards.length,
    };
  }
}

// ====================== UTILITIES ======================
function log(level, message, ...args) {
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  const current = levels[LOG_LEVEL] ?? 2;
  const msgLevel = levels[level] ?? 2;
  if (msgLevel <= current) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [${level.toUpperCase()}] ${message}`, ...args);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Simple https GET (no external deps for fetch)
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
        }
      });
    }).on('error', reject);
  });
}

// ====================== REUSABLE CORE FUNCTIONS (exported for verify script) ======================

/**
 * Fetches the raw JSON content for a given ordinal inscription ID.
 * This is the "live Ordinal JSON" containing { meta, shards }.
 */
async function fetchOrdinalJson(inscriptionId) {
  const url = `${ORDINAL_BASE_URL}/${inscriptionId}`;
  return fetchJson(url);
}

/**
 * Builds an IndexedOrdinal from a raw fetched JSON (no side effects, pure).
 * Used by both main indexer and verify script.
 */
function buildIndexedOrdinal(inscriptionId, json) {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid response: expected JSON object');
  }

  const { meta, shards } = json;

  // Carry over searchTags on each shard so they are preserved in the internal model
  const processedShards = (shards || []).map(s => ({
    ...s,
    searchTags: Array.isArray(s.searchTags) ? s.searchTags : []
  }));

  // Build IndexedOrdinal. Constructor places only `inscriptionTxid` at top level
  // (before `metadata`). No duplicate top-level `inscriptionId` is added here
  // (the internal `inscriptionId` like "OII00000000-demo" stays inside metadata).
  const indexed = new IndexedOrdinal(inscriptionId, meta, processedShards, {});

  return indexed;
}

/**
 * Fetches a single ordinal inscription's content JSON and returns an IndexedOrdinal.
 * The content URL serves the raw { meta, shards } JSON that was inscribed.
 * (Kept for backward compat with main indexer loop.)
 */
async function fetchAndIndexOrdinal(inscriptionId) {
  const url = `${ORDINAL_BASE_URL}/${inscriptionId}`;
  log('info', `Fetching ordinal content for ${inscriptionId} from ${url}`);

  try {
    const json = await fetchJson(url);

    if (!json || typeof json !== 'object') {
      throw new Error('Invalid response: expected JSON object');
    }

    const { meta, shards } = json;

    if (!meta || typeof meta !== 'object') {
      log('warn', `No "meta" object found in ordinal ${inscriptionId}`);
    } else {
      log('debug', `Parsed meta for ${inscriptionId}:`, {
        inscriptionId: meta.inscriptionId,
        shard_index_id: meta.shard_index_id,
        inscriptionType: meta.inscriptionType,
        project: meta.project,
        totalShards: meta.totalShards,
      });
    }

    if (!Array.isArray(shards)) {
      log('warn', `No "shards" array found in ordinal ${inscriptionId}`);
    } else {
      log('info', `Found ${shards.length} shards for ordinal ${inscriptionId}`);
    }

    // Create extensible data model instance
    // In the future we can enrich with on-chain tx data (e.g. inscriptionTxid details).
    const indexed = new IndexedOrdinal(inscriptionId, meta, shards, {
      // inscriptionTxid: '0x...',   // populated in future when we have tx data
    });

    return indexed;

  } catch (err) {
    log('error', `Failed to fetch/index ordinal ${inscriptionId}:`, err.message);
    throw err;
  }
}

// (fetchAndIndexOrdinal is defined above as the reusable version for both main and verify)

/**
 * Indexes a list of ordinals.
 * Returns a Map<inscriptionId, IndexedOrdinal>
 */
async function indexOrdinals(inscriptionIds) {
  const results = new Map();

  for (const id of inscriptionIds) {
    try {
      const indexed = await fetchAndIndexOrdinal(id);
      results.set(id, indexed);

      // Log the full structured data (for visibility in Phase 1)
      log('info', `=== Indexed Ordinal: ${id} ===`);
      console.dir(indexed.toJSON(), { depth: 3, colors: true });

    } catch (err) {
      log('error', `Skipping ordinal ${id} due to error.`);
      // In production we might want to keep last known good data
    }
  }

  return results;
}

// ====================== CONTRACT INTERACTION ======================

/**
 * Maps an IndexedOrdinal's shards to the exact array format expected by
 * the contract's batchAddShards(Shard[] newShards) function.
 *
 * This is the reusable mapping logic. The verify script and the submit
 * function both use it.
 */
function prepareShardsForBatchAddShards(indexedOrdinal) {
  // Use the actual inscription ID of this ordinal (the full txidi0) for auditing
  const actualInscriptionTxid = indexedOrdinal.inscriptionTxid || indexedOrdinal.inscriptionId || '';

  return indexedOrdinal.shards.map((shard) => {
    const web2 = shard.web2 || {};
    const web3 = shard.web3 || {};
    const browser = shard.browser || {};

    return {
      // Use the original shard's `id` from the Ordinal JSON (e.g. 1, 2, 3...)
      // This is the logical shard_id that should be preserved and shown in the UI
      shardId: shard.id != null ? shard.id : 0,

      title: shard.title || '',

      // No longer deriving or including redundant snippet
      // web2 content from the JSON
      web2Url: web2.url || '',
      web2Description: web2.description || '',

      // web3 content from the JSON
      web3Url: web3.url || '',
      web3Description: web3.description || '',

      // Browser config from the JSON
      browserDefaultTab: browser.defaultTab || '',
      web2Locked: !!browser.web2Locked,
      web3Locked: !!browser.web3Locked,

      // Search tags carried from original shard for future use / filtering
      searchTags: Array.isArray(shard.searchTags) ? shard.searchTags : [],

      // Ordinal metadata association (from the inscription's meta)
      inscriptionId: indexedOrdinal.metadata?.inscriptionId || indexedOrdinal.inscriptionId || '',

      shardIndexId: indexedOrdinal.metadata?.shard_index_id || '',

      // Auditing: the actual inscription ID (txidi0) of this ordinal
      inscriptionTxid: actualInscriptionTxid,

      // No merkleProof needed at this time

      chain: indexedOrdinal.metadata?.chain || '',
    };
  });
}

/**
 * Submits the indexed ordinal's shards to the deployed OrdinalReassemblerV2 contract
 * using the batchAddShards function for gas efficiency.
 *
 * This reuses prepareShardsForBatchAddShards for the mapping.
 */
async function submitIndexedOrdinalToContract(indexedOrdinal) {
  const rpcUrl = RPC_URL;
  const privateKey = PRIVATE_KEY;
  const contractAddress = CONTRACT_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    log('debug', 'Contract submission skipped (LITVM_RPC_URL/RPC_URL, PRIVATE_KEY or CONTRACT_ADDRESS not set in .env)');
    return;
  }

  const inscriptionIdForLog = indexedOrdinal.metadata?.inscriptionId || indexedOrdinal.inscriptionId || 'unknown';
  log('info', `Preparing to submit ${indexedOrdinal.shards.length} shards for ordinal ${inscriptionIdForLog} to contract at ${contractAddress}...`);

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Create contract instance with the minimal ABI for batchAddShards
    const contract = new ethers.Contract(contractAddress, ORDINAl_REASSEMBLER_V2_ABI, wallet);

    const contractShards = prepareShardsForBatchAddShards(indexedOrdinal);

    log('info', `Calling batchAddShards on contract with ${contractShards.length} mapped shards...`);

    // Call the batch function (onlyOwner protected on-chain)
    const tx = await contract.batchAddShards(contractShards);

    log('info', `Transaction submitted: ${tx.hash} (waiting for confirmation...)`);

    const receipt = await tx.wait();

    log('info', `✅ Batch submission confirmed! Tx: ${tx.hash} | Block: ${receipt.blockNumber} | Gas used: ${receipt.gasUsed.toString()}`);
    log('info', `   Submitted ${contractShards.length} shards for inscription ${inscriptionIdForLog} (shard_index_id: ${indexedOrdinal.metadata?.shard_index_id || 'n/a'})`);

  } catch (err) {
    log('error', `Contract submission failed for ${inscriptionIdForLog}:`, err.message || err);
    // Do not throw — allow the indexer to continue with other ordinals / future syncs
  }
}

// ====================== MAIN LOOP ======================
let isRunning = false;

async function syncOnce() {
  if (isRunning) {
    log('warn', 'Sync already in progress, skipping this interval.');
    return;
  }
  isRunning = true;

  log('info', `=== Starting OrdNET indexer sync for ${INSCRIPTION_IDS.length} ordinal(s) ===`);

  try {
    const indexedMap = await indexOrdinals(INSCRIPTION_IDS);

    // Future: for each successfully indexed ordinal, submit to contract
    for (const [id, indexed] of indexedMap.entries()) {
      await submitIndexedOrdinalToContract(indexed);
    }

    log('info', `=== Sync complete. Indexed ${indexedMap.size} ordinal(s). Next run in ${Math.round(SYNC_INTERVAL_MS / 1000)}s ===`);
  } catch (err) {
    log('error', 'Unexpected error during sync:', err);
  } finally {
    isRunning = false;
  }
}

async function main() {
  log('info', 'OrdNET Indexer starting...');
  log('info', `Inscription IDs: ${INSCRIPTION_IDS.join(', ')}`);
  log('info', `Sync interval: ${SYNC_INTERVAL_MS}ms`);

  // Run once immediately
  await syncOnce();

  // Support --once flag for one-shot runs (useful in cron or CI)
  if (process.argv.includes('--once')) {
    log('info', 'Running in --once mode, exiting after first sync.');
    process.exit(0);
  }

  // Continuous mode
  log('info', 'Entering continuous sync mode (Ctrl+C to stop)...');
  setInterval(syncOnce, SYNC_INTERVAL_MS);

  // Graceful shutdown
  process.on('SIGINT', () => {
    log('info', 'Shutting down indexer...');
    process.exit(0);
  });
}

// Only run main() if this file is executed directly (not required as a module)
if (require.main === module) {
  main().catch(err => {
    log('error', 'Fatal indexer error:', err);
    process.exit(1);
  });
}

// Export core functions for reuse by verify script (and future modules)
module.exports = {
  fetchOrdinalJson,
  buildIndexedOrdinal,
  fetchAndIndexOrdinal,
  indexOrdinals,
  prepareShardsForBatchAddShards,
};
