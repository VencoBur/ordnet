#!/usr/bin/env node

/**
 * run-full-verification.js
 *
 * Root-level orchestrator for end-to-end verification using REAL data:
 *   1. Runs the indexer verification script (which fetches live Ordinal data,
 *      builds the IndexedOrdinal, prepares the exact batchAddShards payload,
 *      prints everything to console, AND writes the payload array to
 *      test-data/real-indexer-payload.json).
 *   2. Runs the Hardhat contract tests, which now load and use that real
 *      payload instead of hardcoded samples.
 *
 * Usage (from monorepo root):
 *   node scripts/run-full-verification.js
 *   npm run verify:all
 *
 * Clear section headers are printed for readability.
 */

const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');

console.log('\n' + '='.repeat(70));
console.log('ORDNET FULL VERIFICATION ORCHESTRATOR');
console.log('  - Step 1: Indexer verification (real fetch + payload generation)');
console.log('  - Step 2: Hardhat contract tests (using the generated real payload)');
console.log('='.repeat(70) + '\n');

let hadError = false;

try {
  console.log('\n' + '-'.repeat(70));
  console.log('>>> SECTION 1: INDEXER VERIFICATION');
  console.log('    Command: npm run verify   (inside indexer/)');
  console.log('    (This produces test-data/real-indexer-payload.json)');
  console.log('-'.repeat(70) + '\n');

  execSync('npm run verify', {
    cwd: path.join(rootDir, 'indexer'),
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('\n' + '-'.repeat(70));
  console.log('<<< SECTION 1 COMPLETE: Indexer verification finished (payload written)');
  console.log('-'.repeat(70) + '\n');
} catch (err) {
  console.error('\n!!! SECTION 1 FAILED: Indexer verification encountered an error.');
  console.error('    (See output above. This may be due to network fetch issues for the live Ordinal.)');
  hadError = true;
  // Continue to run contract tests anyway (they will fail to load payload if verify didn't write it)
}

try {
  console.log('\n' + '-'.repeat(70));
  console.log('>>> SECTION 2: HARDHAT CONTRACT TESTS');
  console.log('    Command: npm test   (inside contracts/)');
  console.log('    (Loads real payload from test-data/real-indexer-payload.json)');
  console.log('-'.repeat(70) + '\n');

  execSync('npm test', {
    cwd: path.join(rootDir, 'contracts'),
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('\n' + '-'.repeat(70));
  console.log('<<< SECTION 2 COMPLETE: Contract tests finished');
  console.log('-'.repeat(70) + '\n');
} catch (err) {
  console.error('\n!!! SECTION 2 FAILED: Hardhat contract tests encountered an error.');
  console.error('    (See output above. Make sure the payload JSON was written by Step 1.)');
  hadError = true;
}

console.log('\n' + '='.repeat(70));
console.log('ORDNET FULL VERIFICATION COMPLETE');
if (hadError) {
  console.log('One or more steps reported errors (see logs above).');
  console.log('The contract tests now consume real data produced by the indexer when Step 1 succeeds.');
  process.exit(1);
} else {
  console.log('All steps completed successfully.');
  console.log('Contract tests used the REAL payload generated from live Ordinal data by the indexer.');
}
console.log('='.repeat(70) + '\n');
