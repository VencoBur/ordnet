/**
 * OrdNET Indexer Verification Script
 *
 * Purpose: Allows the user to inspect exactly what data the indexer is processing
 * at each stage, without actually submitting anything to the blockchain.
 *
 * Usage:
 *   npm run verify
 *   npm run verify -- --once   (same as default for this script)
 *
 * It reuses the core logic from indexer.js:
 *   - fetchOrdinalJson (raw fetch)
 *   - buildIndexedOrdinal (parsing into our data model)
 *   - prepareShardsForBatchAddShards (the exact mapping that would be sent to the contract)
 *
 * This makes it easy to verify that:
 *   1. The live Ordinal JSON (meta + shards) is being fetched correctly.
 *   2. The IndexedOrdinal model is built properly (preserving all meta and shards).
 *   3. The final payload for batchAddShards matches the field mapping requirements.
 *
 * No contract calls are made (even if CONTRACT_ADDRESS etc. are set).
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

const { fetchOrdinalJson, buildIndexedOrdinal, prepareShardsForBatchAddShards } = require('./indexer');

// Same config loading as the main indexer
const INSCRIPTION_IDS = (process.env.ORDINAL_INSCRIPTION_IDS ||
  '8e7045fdfc041122c36443f5709edb613494a75f760ec318de911555bb1bfb78i0')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

async function verifyOnce() {
  console.log('=== OrdNET Indexer Verification ===\n');
  console.log(`Inscription transaction ID's to verify: ${INSCRIPTION_IDS.join(', ')}\n`);

  for (const inscriptionId of INSCRIPTION_IDS) {
    console.log(`\n========== RAW JSON FETCHED for ${inscriptionId} ==========`);
    console.log('(This is the exact content served by the Ordinal server)');

    let json;
    try {
      json = await fetchOrdinalJson(inscriptionId);
      console.dir(json, { depth: 4, colors: true });
    } catch (err) {
      console.error('Failed to fetch raw JSON:', err.message);
      continue;
    }

    console.log(`\n========== IndexedOrdinal after processing for ${inscriptionId} ==========`);
    console.log('(This is our internal data model. It preserves the full meta and all shards. Note: only inscriptionTxid at top level before metadata; the short inscriptionId lives inside metadata.)');

    let indexed;
    try {
      indexed = buildIndexedOrdinal(inscriptionId, json);
      console.dir(indexed.toJSON(), { depth: 3, colors: true });
    } catch (err) {
      console.error('Failed to build IndexedOrdinal:', err.message);
      continue;
    }

    console.log(`\n========== Payload that would be sent to batchAddShards() for ${inscriptionId} ==========`);
    console.log('(This is the exact array of objects after the required field mapping.)');
    console.log('(shardId is now taken from the original shard "id" in the JSON (e.g. 1, 2, 3...);');
    console.log(' searchTags are carried over; inscriptionTxid is set to the actual ordinal inscription ID.)');

    const contractShards = prepareShardsForBatchAddShards(indexed);
    console.dir(contractShards, { depth: 2, colors: true });

    // Write the prepared payload to a JSON file so that the Hardhat contract tests
    // (in contracts/test/...) can consume *real* data produced by the indexer
    // instead of hardcoded samples. The file is at the monorepo root.
    // This runs for every ID (last one wins if multiple); normal console output is unchanged.
    try {
      const testDataDir = path.join(__dirname, '../../test-data');
      fs.mkdirSync(testDataDir, { recursive: true });
      const payloadPath = path.join(testDataDir, 'real-indexer-payload.json');
      fs.writeFileSync(payloadPath, JSON.stringify(contractShards, null, 2));
      console.log(`\n[verify] Wrote real batchAddShards payload for ${inscriptionId} to ${payloadPath}`);
    } catch (writeErr) {
      console.error('Failed to write real-indexer-payload.json:', writeErr.message);
    }

    console.log(`\n(End of data for ${inscriptionId})\n`);
  }

  console.log('=== Verification complete ===');
  console.log('Review the sections above to confirm:');
  console.log('  - Raw meta (including inscriptionId, shard_index_id, etc.) was read correctly.');
  console.log('  - All shards were parsed (with searchTags preserved) and associated with the ordinal metadata.');
  console.log('  - The contract payload has correct shardId from original "id", includes searchTags,');
  console.log('    sets inscriptionTxid to the real ordinal ID, and omits snippet (merkleProof removed from model).');
  console.log('  - Real payload JSON written to test-data/real-indexer-payload.json for contract tests.');
}

async function main() {
  await verifyOnce();

  // Support --once for consistency with the main indexer (though verify is inherently one-shot)
  if (process.argv.includes('--once')) {
    console.log('Running in --once mode (default for verify).');
  }

  // No continuous mode for verify script.
}

main().catch(err => {
  console.error('Fatal error in verify script:', err);
  process.exit(1);
});
