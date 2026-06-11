// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title OrdinalReassemblerV2
/// @notice Improved contract for storing and querying shards from real Ordinal inscriptions.
/// @dev Designed to work with the OrdNET Node.js indexer that pushes data from live Ordinal JSON {meta, shards}.
///      Supports ordinal-level metadata (inscriptionId, shard_index_id) and web2/web3 content fields.
///      Extensible for multiple ordinals via per-shard inscriptionId association.
contract OrdinalReassemblerV2 {
    // ============================================================
    // STRUCTS
    // ============================================================

    /// @notice Represents a single shard from an Ordinal dual-index inscription.
    /// @dev web2/web3 fields mirror the structure in the Ordinal JSON.
    ///      browser* fields capture the browser config.
    ///      searchTags carried from indexer for future use.
    ///      inscriptionId + shardIndexId link the shard to its parent ordinal's meta.
    struct Shard {
        uint256 shardId;                // Auto-assigned incremental ID
        string title;                   // From shard.title
        // Web2 content (can be empty if null in JSON)
        string web2Url;
        string web2Description;
        // Web3 content (can be empty if null in JSON)
        string web3Url;
        string web3Description;
        // Browser behavior from the JSON
        string browserDefaultTab;
        bool web2Locked;
        bool web3Locked;
        // Search tags carried from the indexer payload (for future filtering / on-chain queries)
        string[] searchTags;
        // Ordinal metadata association (from the inscription's meta)
        string inscriptionId;           // meta.inscriptionId
        string shardIndexId;            // meta.shard_index_id
        // Transaction / auditing info (populated by indexer when available)
        string inscriptionTxid;
        string chain;                   // meta.chain or shard-specific
    }

    // ============================================================
    // STATE
    // ============================================================

    address public owner;
    Shard[] private shards;
    uint256 private nextShardId = 1;
    uint256 public constant MAX_SHARDS = 100;

    /// @dev Maps inscriptionId (from meta) => array of shard indices in the shards array.
    ///      Enables efficient getShardsByInscription and supports multi-ordinal storage.
    mapping(string => uint256[]) private shardsByInscription;

    // ============================================================
    // EVENTS
    // ============================================================

    event ShardAdded(
        uint256 indexed shardId,
        string title,
        string inscriptionId,
        string shardIndexId
    );

    event BatchShardsAdded(uint256 count, string inscriptionId);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ============================================================
    // MODIFIERS
    // ============================================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    constructor() {
        owner = msg.sender;
        // No hardcoded seeding - data comes from the indexer + real Ordinals
    }

    // ============================================================
    // WRITE FUNCTIONS (owner only)
    // ============================================================

    /// @notice Add a single shard. Recommended for manual/testing use.
    /// @param newShard The shard data (shardId will be overwritten)
    function addShard(Shard memory newShard) external onlyOwner {
        _addSingleShard(newShard);
    }

    /// @notice Batch add shards. Preferred method for the Node.js indexer.
    /// @param newShards Array of shards to add in one transaction (gas efficient)
    function batchAddShards(Shard[] memory newShards) external onlyOwner {
        require(
            shards.length + newShards.length <= MAX_SHARDS,
            "Maximum shards would be exceeded"
        );

        string memory batchInscriptionId = "";
        uint256 addedCount = 0;

        for (uint256 i = 0; i < newShards.length; i++) {
            Shard memory s = newShards[i];
            _validateShard(s);

            uint256 currentIndex = shards.length;
            s.shardId = nextShardId++;

            shards.push(s);

            if (bytes(s.inscriptionId).length > 0) {
                shardsByInscription[s.inscriptionId].push(currentIndex);
                if (bytes(batchInscriptionId).length == 0) {
                    batchInscriptionId = s.inscriptionId;
                }
            }

            emit ShardAdded(s.shardId, s.title, s.inscriptionId, s.shardIndexId);
            addedCount++;
        }

        if (addedCount > 0) {
            emit BatchShardsAdded(addedCount, batchInscriptionId);
        }
    }

    /// @notice Transfer contract ownership.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ============================================================
    // VIEW FUNCTIONS
    // ============================================================

    /// @notice Search primarily by shard-level searchTags (case-insensitive partial match on any tag),
    ///         with title as a secondary/fallback match.
    /// @dev Metadata fields (inscriptionId, shardIndexId, inscriptionTxid, chain, etc.) are stored
    ///      for reference and multi-inscription support but are explicitly NOT used for search matching.
    ///      This keeps results clean, shard-level, and free of metadata-polluted or duplicate entries.
    function search(string memory query) external view returns (Shard[] memory matchedShards) {
        require(bytes(query).length > 0, "Query cannot be empty");

        bytes memory queryLower = bytes(_toLower(query));

        // Count matches: searchTags primary + title secondary
        uint256 matchCount = 0;
        for (uint256 i = 0; i < shards.length; i++) {
            Shard storage s = shards[i];
            if (
                _matchesSearchTags(s.searchTags, queryLower) ||
                _contains(s.title, queryLower)
            ) {
                matchCount++;
            }
        }

        // Build result array (clean shard-level results only)
        matchedShards = new Shard[](matchCount);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < shards.length; i++) {
            Shard storage s = shards[i];
            if (
                _matchesSearchTags(s.searchTags, queryLower) ||
                _contains(s.title, queryLower)
            ) {
                matchedShards[resultIndex] = s;
                resultIndex++;
            }
        }

        return matchedShards;
    }

    /// @notice Returns all stored shards.
    function getAllShards() external view returns (Shard[] memory) {
        return shards;
    }

    /// @notice Returns the total number of shards stored.
    function getShardCount() external view returns (uint256) {
        return shards.length;
    }

    /// @notice Returns all shards that belong to a specific ordinal (by its inscriptionId from meta).
    /// @dev Useful when supporting multiple ordinals in the future.
    function getShardsByInscription(string memory inscriptionId)
        external
        view
        returns (Shard[] memory)
    {
        uint256[] storage indices = shardsByInscription[inscriptionId];
        Shard[] memory result = new Shard[](indices.length);

        for (uint256 i = 0; i < indices.length; i++) {
            result[i] = shards[indices[i]];
        }
        return result;
    }

    // ============================================================
    // INTERNAL HELPERS
    // ============================================================

    function _addSingleShard(Shard memory s) private {
        require(shards.length < MAX_SHARDS, "Maximum shards reached");
        _validateShard(s);

        uint256 currentIndex = shards.length;
        s.shardId = nextShardId++;
        shards.push(s);

        if (bytes(s.inscriptionId).length > 0) {
            shardsByInscription[s.inscriptionId].push(currentIndex);
        }

        emit ShardAdded(s.shardId, s.title, s.inscriptionId, s.shardIndexId);
    }

    function _validateShard(Shard memory s) private pure {
        require(bytes(s.title).length > 0, "Title cannot be empty");
    }

    /// @dev Helper to check if query matches any searchTag (case-insensitive partial).
    ///      Primary driver for shard-level search.
    function _matchesSearchTags(string[] memory tags, bytes memory queryLower) private pure returns (bool) {
        for (uint256 i = 0; i < tags.length; i++) {
            if (_contains(tags[i], queryLower)) {
                return true;
            }
        }
        return false;
    }

    /// @dev Converts string to lowercase (for case-insensitive search)
    function _toLower(string memory str) private pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);

        for (uint256 i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }

    /// @dev Case-insensitive contains check
    function _contains(string memory target, bytes memory queryLower) private pure returns (bool) {
        bytes memory targetLower = bytes(_toLower(target));

        if (queryLower.length > targetLower.length) {
            return false;
        }
        if (queryLower.length == 0) {
            return true;
        }

        for (uint256 i = 0; i <= targetLower.length - queryLower.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < queryLower.length; j++) {
                if (targetLower[i + j] != queryLower[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }
        return false;
    }
}
