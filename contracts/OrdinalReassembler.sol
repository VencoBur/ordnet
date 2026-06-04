// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title OrdinalReassembler
/// @notice Stores and retrieves Litecoin Ordinal shards reassembled on LitVM
/// @dev Built for LiteForge Hackathon - LitVM testnet (Chain ID 4441)
contract OrdinalReassembler {
    // Struct representing a single Ordinal shard
    struct Shard {
        uint256 shardId;
        string title;
        string snippet;
        string url;
        string inscriptionTxid;
        string merkleProof;
        string chain;
    }

    // State variables
    address public owner;
    Shard[] private shards;
    uint256 private nextShardId;
    uint256 public constant MAX_SHARDS = 50;

    // Events
    event ShardAdded(uint256 indexed shardId, string title, string chain);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextShardId = 1;
        _seedInitialShards();
    }

    /// @notice Internal function to seed initial shards
    function _seedInitialShards() private {
        // Shard 1: Litecoin documentation
        shards.push(Shard({
            shardId: nextShardId++,
            title: "Litecoin Official Documentation",
            snippet: "Comprehensive guide to Litecoin protocol, mining, and integration. Built on Scrypt PoW with 2.5 minute blocks.",
            url: "https://litecoin.org/en/resources",
            inscriptionTxid: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
            merkleProof: "0x1234567890abcdef",
            chain: "Litecoin"
        }));

        // Shard 2: Ordinals protocol
        shards.push(Shard({
            shardId: nextShardId++,
            title: "Ordinals Theory Handbook",
            snippet: "Complete guide to ordinal theory, inscription methods, and satoshi tracking on Bitcoin and Litecoin.",
            url: "https://docs.ordinals.com",
            inscriptionTxid: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
            merkleProof: "0x2345678901bcdef0",
            chain: "Bitcoin"
        }));

        // Shard 3: LitVM technical spec
        shards.push(Shard({
            shardId: nextShardId++,
            title: "LitVM Technical Specification",
            snippet: "Layer-2 EVM execution environment on Litecoin. Deploy Solidity contracts with zkLTC gas token.",
            url: "https://litvm.io/docs",
            inscriptionTxid: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4",
            merkleProof: "0x3456789012cdef01",
            chain: "LitVM"
        }));

        // Shard 4: Web4 manifesto
        shards.push(Shard({
            shardId: nextShardId++,
            title: "The Web4 Manifesto",
            snippet: "Seamless integration of Web2 UX with Web3 data integrity. One interface, universal access, cryptographic guarantees.",
            url: "https://web4.foundation/manifesto",
            inscriptionTxid: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
            merkleProof: "0x456789013def0123",
            chain: "Litecoin"
        }));

        // Shard 5: Decentralized storage
        shards.push(Shard({
            shardId: nextShardId++,
            title: "Permanent Storage on Bitcoin & Litecoin",
            snippet: "How ordinal inscriptions enable immutable, censorship-resistant data storage on proof-of-work blockchains.",
            url: "https://ordinals.storage/guide",
            inscriptionTxid: "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
            merkleProof: "0x56789014ef012345",
            chain: "Bitcoin"
        }));
    }

    /// @notice Add a new shard (owner only)
    /// @param newShard The shard data to add
    function addShard(Shard memory newShard) external onlyOwner {
        require(shards.length < MAX_SHARDS, "Maximum shards reached");
        require(bytes(newShard.title).length > 0, "Title cannot be empty");
        require(bytes(newShard.url).length > 0, "URL cannot be empty");
        require(bytes(newShard.chain).length > 0, "Chain cannot be empty");

        newShard.shardId = nextShardId++;
        shards.push(newShard);

        emit ShardAdded(newShard.shardId, newShard.title, newShard.chain);
    }

    /// @notice Search shards by query string
    /// @param query The search term (case-insensitive)
    /// @return matchedShards Array of shards matching the query
    function search(string memory query) external view returns (Shard[] memory matchedShards) {
        require(bytes(query).length > 0, "Query cannot be empty");

        // First pass: count matches
        uint256 matchCount = 0;
        bytes memory queryLower = bytes(_toLower(query));

        for (uint256 i = 0; i < shards.length; i++) {
            if (_contains(shards[i].title, queryLower) ||
                _contains(shards[i].snippet, queryLower) ||
                _contains(shards[i].chain, queryLower)) {
                matchCount++;
            }
        }

        // Second pass: populate results
        matchedShards = new Shard[](matchCount);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < shards.length; i++) {
            if (_contains(shards[i].title, queryLower) ||
                _contains(shards[i].snippet, queryLower) ||
                _contains(shards[i].chain, queryLower)) {
                matchedShards[resultIndex] = shards[i];
                resultIndex++;
            }
        }

        return matchedShards;
    }

    /// @notice Get all stored shards
    /// @return All shards in storage
    function getAllShards() external view returns (Shard[] memory) {
        return shards;
    }

    /// @notice Get total number of shards
    /// @return Total shard count
    function getShardCount() external view returns (uint256) {
        return shards.length;
    }

    /// @notice Transfer ownership to a new address
    /// @param newOwner The address of the new owner
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /// @dev Internal helper: convert string to lowercase
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

    /// @dev Internal helper: check if target contains query
    function _contains(string memory target, bytes memory query) private pure returns (bool) {
        bytes memory targetLower = bytes(_toLower(target));
        
        if (query.length > targetLower.length) {
            return false;
        }
        
        if (query.length == 0) {
            return true;
        }

        for (uint256 i = 0; i <= targetLower.length - query.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < query.length; j++) {
                if (targetLower[i + j] != query[j]) {
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
