# OrdNET Indexer

Off-chain Node.js service that scans Litecoin Ordinal inscriptions for dual-index metadata (`meta` + `shards` arrays) and prepares the data for on-chain submission to the `OrdinalReassembler` contract on LitVM.

## Goals

- Parse and preserve the full `meta` object from inscribed JSON (inscriptionId, shard_index_id, inscriptionType, chain, project, etc.).
- Associate every shard with its parent ordinal's metadata.
- Be ready for transaction/auditing fields (`inscriptionTxid`, merkle proofs, etc.).
- Extensible to many ordinals (just add more inscription IDs).
- Phase 1: periodic fetching + logging + contract submission stubs.

## Current Behavior (Phase 1)

- Fetches the live dual-index JSON from `https://ordliteverse.com/content/<inscriptionId>`
- Parses `meta` and `shards`.
- Builds an `IndexedOrdinal` data model.
- Logs everything nicely.
- Runs continuously with `setInterval` (re-syncs periodically).
- Stubs for future `ethers` contract interaction.

## Setup

1. Make sure you're in the `indexer/` directory:
   ```bash
   cd indexer
   ```

2. Install dependencies (already done if you followed the monorepo setup):
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in at least:
   - `ORDINAL_INSCRIPTION_IDS` (comma-separated)
   - `SYNC_INTERVAL_MS` (optional)

   For future contract integration also set:
   - `RPC_URL`
   - `PRIVATE_KEY`
   - `CONTRACT_ADDRESS`

## Running

**One-time sync (recommended for testing):**
```bash
npm run sync-once
# or
node src/indexer.js --once
```

**Continuous mode (re-syncs every N ms):**
```bash
npm start
# or
node src/indexer.js
```

**Development (auto-reload on file change):**
```bash
npm run dev
```

The script will:
- Immediately fetch and log the indexed data for the configured ordinals.
- Then keep running and re-sync on the interval defined in `SYNC_INTERVAL_MS`.

## Data Model (Extensibility)

```js
class IndexedOrdinal {
  inscriptionId
  metadata          // the full meta object from the inscription
  shards            // array of shard objects
  lastSynced
  inscriptionTxid   // future auditing field
  merkleProof       // future auditing field
}
```

Adding support for more ordinals is as simple as adding another ID to the `ORDINAL_INSCRIPTION_IDS` env var. The `Map<inscriptionId, IndexedOrdinal>` storage pattern already supports N ordinals.

## Future Integration

When the `OrdinalReassembler` contract is deployed on LitVM:
1. Set the three contract env vars.
2. Implement the real `submitIndexedOrdinalToContract` logic (the stub is already there with comments).
3. The indexer will be able to call `reassemble(...)` (or whatever the final function signature is) with the `metadata` + serialized `shards`.

## Notes

- This service is **read-only** in Phase 1 (just fetches and logs).
- It never modifies the `frontend/` or `contracts/` code.
- Designed to be the bridge between live Ordinals and the on-chain `OrdinalReassembler`.
