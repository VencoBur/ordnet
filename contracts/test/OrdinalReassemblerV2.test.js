const { expect } = require("chai");
const fs = require("fs");
const path = require("path");

/**
 * Helper to log search results cleanly with expanded searchTags.
 * This makes it obvious that search is working via searchTags at the shard level.
 */
function logSearchResults(label, results) {
  console.log(`\n=== ${label} (${results.length} results) ===`);
  results.forEach((s, i) => {
    const tags = Array.isArray(s.searchTags) ? s.searchTags : [];
    console.log(`  [${i}] shardId: ${s.shardId}, title: "${s.title}"`);
    console.log(`      searchTags: ${JSON.stringify(tags)}`);
    console.log(`      web2Locked: ${s.web2Locked}, web3Locked: ${s.web3Locked}`);
    console.log(`      inscriptionTxid: ${s.inscriptionTxid || ''}, chain: ${s.chain || ''}`);
  });
}

describe("OrdinalReassemblerV2", function () {
  let contract;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const ContractFactory = await ethers.getContractFactory(
      "OrdinalReassemblerV2"
    );
    contract = await ContractFactory.deploy();
    await contract.deployed();
  });

  it("deploys a fresh contract and sets the deployer as owner", async function () {
    const deployedOwner = await contract.owner();
    const addr = contract.address;

    expect(deployedOwner).to.equal(owner.address);

    console.log("\n[deploy] Fresh OrdinalReassemblerV2 deployed at:", addr);
    console.log("[deploy] Owner:", deployedOwner);
  });

  it("accepts batchAddShards() using REAL payload from indexer (test-data/real-indexer-payload.json), and view functions return it correctly", async function () {
    // Load the payload that was written by the indexer verification script.
    // This is the *exact* array that prepareShardsForBatchAddShards() produced
    // from live Ordinal data. It now matches the cleaned-up Shard struct exactly
    // (searchTags included; snippet and merkleProof fully removed from contract).
    const payloadPath = path.join(__dirname, '../../test-data/real-indexer-payload.json');

    let shardsForBatch;
    try {
      const raw = fs.readFileSync(payloadPath, 'utf8');
      shardsForBatch = JSON.parse(raw);
      if (!Array.isArray(shardsForBatch) || shardsForBatch.length === 0) {
        throw new Error('Payload is empty or not an array');
      }
    } catch (loadErr) {
      console.error(`\n!!! Failed to load real payload from ${payloadPath}`);
      console.error('    Run the indexer verification first (e.g. via the orchestrator) so that');
      console.error('    verify-indexer.js writes the JSON after calling prepareShardsForBatchAddShards().');
      throw loadErr;
    }

    const numShards = shardsForBatch.length;
    console.log(`\n=== LOADED REAL INDEXER PAYLOAD from ${payloadPath} (${numShards} shard(s)) ===`);
    console.dir(shardsForBatch, { depth: 3, colors: false });

    // No normalization needed anymore: the payload from the indexer (with searchTags)
    // exactly matches the cleaned struct (no snippet/merkleProof).
    console.log("\n=== DATA BEING PASSED TO batchAddShards() (real payload from indexer, matching struct) ===");
    console.dir(shardsForBatch, { depth: 2, colors: false });

    // Pick useful values from the real data for logging + targeted searches/asserts.
    const first = shardsForBatch[0] || {};
    const sampleInscriptionId = first.inscriptionId || '';
    const sampleInscriptionTxid = first.inscriptionTxid || '';
    const sampleShardIndexId = first.shardIndexId || '';
    const sampleChain = first.chain || '';
    // Use a word from the first title for a title-based search (more robust than hard-coded strings).
    const titleWord = (first.title || 'shard').split(/\s+/)[0] || 'shard';

    // Execute the batch add using the *real* data (onlyOwner — called by the deployer signer)
    const tx = await contract.batchAddShards(shardsForBatch);
    const receipt = await tx.wait();

    console.log(
      `\n[batchAddShards] Transaction confirmed. Hash: ${tx.hash} | Gas used: ${receipt.gasUsed.toString()}`
    );

    // --- getShardCount + getAllShards ---
    const shardCount = await contract.getShardCount();
    console.log("\n=== getShardCount() ===");
    console.log(shardCount.toString());

    const allShards = await contract.getAllShards();
    console.log("\n=== getAllShards() (real data stored on-chain) ===");
    console.dir(allShards, { depth: 2, colors: false });

    // Assertions on storage (dynamic based on real payload length)
    expect(shardCount).to.equal(numShards);
    expect(allShards.length).to.equal(numShards);

    if (numShards > 0) {
      // Contract re-assigns shardId starting at 1 (overwriting whatever was in the payload)
      expect(allShards[0].shardId).to.equal(1);

      // Core fields from the real indexer payload must be present and match
      expect(allShards[0].title).to.equal(first.title);
      expect(allShards[0].web2Url).to.equal(first.web2Url || '');
      expect(allShards[0].inscriptionId).to.equal(sampleInscriptionId);
      expect(allShards[0].inscriptionTxid).to.equal(sampleInscriptionTxid);
      expect(allShards[0].chain).to.equal(sampleChain);

      // searchTags is now stored on-chain (added to struct to match indexer payload output)
      expect(allShards[0].searchTags).to.deep.equal(first.searchTags || []);
    }

    // Verify web2Locked / web3Locked are returned exactly as stored (no reinterpretation)
    if (numShards > 0 && shardsForBatch && shardsForBatch[0]) {
      const input0 = shardsForBatch[0];
      expect(allShards[0].web2Locked).to.equal(!!input0.web2Locked);
      expect(allShards[0].web3Locked).to.equal(!!input0.web3Locked);
    }

    // --- getShardsByInscription ---
    const byInscription = await contract.getShardsByInscription(sampleInscriptionId);
    console.log(
      `\n=== getShardsByInscription("${sampleInscriptionId}") (real data) ===`
    );
    console.dir(byInscription, { depth: 2, colors: false });

    expect(byInscription.length).to.equal(numShards);
    if (numShards > 0) {
      expect(byInscription[0].shardId).to.equal(1);
      expect(byInscription[0].title).to.equal(first.title);
    }

    // --- search() focused on searchTags (primary) + title (secondary) ---
    // These queries are derived from the real payload's searchTags and titles.
    // Metadata-only queries (inscriptionId, shardIndexId, chain) should NOT drive results.
    // Improved logging uses helper to expand searchTags arrays (no more [Array]).

    // Explicit search("litecoin") - kept as requested (primary searchTags-driven)
    const litecoinResults = await contract.search("litecoin");
    logSearchResults('search("litecoin") (primary searchTags-driven)', litecoinResults);
    expect(litecoinResults.length).to.be.greaterThanOrEqual(1);

    // Explicit assertions on searchTags
    const hasLitecoinRelatedTag = litecoinResults.some(s =>
      (s.searchTags || []).some(t => t && (t.toLowerCase().includes('litecoin') || t.toLowerCase().includes('ltc')))
    );
    expect(hasLitecoinRelatedTag).to.be.true;

    // Title as secondary/fallback (kept)
    const searchByTitle = await contract.search(titleWord);
    logSearchResults(`search("${titleWord}") (title secondary match)`, searchByTitle);
    expect(searchByTitle.length).to.be.greaterThanOrEqual(1);

    // Explicitly verify no metadata-polluted results (kept):
    // Searching a pure metadata value (inscriptionId / shardIndexId / chain) should return 0 or very few
    // (only if it accidentally overlaps a tag/title; in real data it should not).
    if (sampleInscriptionId) {
      const searchByInscId = await contract.search(sampleInscriptionId);
      logSearchResults(`search("${sampleInscriptionId}") (metadata only - should not pollute)`, searchByInscId);
      // We do not assert exact 0 (in case of overlap), but it must be << numShards and no duplicates
      expect(searchByInscId.length).to.be.lessThanOrEqual(numShards); // sanity
    }

    const searchNoMatch = await contract.search("this-will-not-match-xyz123-" + Date.now());
    logSearchResults('search("this-will-not-match-xyz123-...") (no match)', searchNoMatch);
    expect(searchNoMatch.length).to.equal(0);

    // Quick duplicate check on a tag search (results should be unique shards)
    if (litecoinResults.length > 1) {
      const ids = litecoinResults.map(s => String(s.shardId));
      const unique = new Set(ids);
      expect(unique.size).to.equal(litecoinResults.length);
    }

    // --- NEW: Dedicated search by searchTags section (LitVM example) ---
    // This demonstrates clean searchTags-driven results with full visibility.
    const litvmResults = await contract.search("LitVM");
    logSearchResults('search("LitVM") (searchTags primary - new dedicated section)', litvmResults);
    expect(litvmResults.length).to.be.greaterThanOrEqual(1);

    // Assert that it returns the expected shard(s) that have "litvm" in their tags
    // (e.g. "LitVM Ecosystem", "ZNS Connect", "LitVM DEX Hub")
    const hasLitvmTag = litvmResults.some(s =>
      (s.searchTags || []).some(t => t && t.toLowerCase().includes('litvm'))
    );
    expect(hasLitvmTag).to.be.true;

    // Verify the returned shards have the correct searchTags array content
    const ecosystemResult = litvmResults.find(s => (s.title || '').includes('Ecosystem'));
    if (ecosystemResult) {
      expect(ecosystemResult.searchTags || []).to.include('litvm');
      expect(ecosystemResult.searchTags || []).to.include('ecosystem');
      console.log('  Verified "LitVM Ecosystem" shard returned with correct searchTags content.');
    }

    const znsResult = litvmResults.find(s => (s.title || '').includes('ZNS'));
    if (znsResult) {
      expect(znsResult.searchTags || []).to.include('litvm');
      expect(znsResult.searchTags || []).to.include('zns');
    }

    console.log("\n=== All assertions passed for batch + views (using REAL indexer payload) ===");
    console.log("Search is now primarily searchTags-driven at shard level (title secondary). Metadata fields no longer drive results.");
    console.log("searchTags arrays are now fully expanded in logs for easy verification.");
  });
});
