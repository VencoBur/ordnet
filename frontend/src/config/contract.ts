// Contract configuration for LitVM testnet
export const CONTRACT_ADDRESS = '0x0b478258fC73b02A9C2F24e04e7E8a31fDBac15C';

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "shardId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "chain",
        "type": "string"
      }
    ],
    "name": "ShardAdded",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_SHARDS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "shardId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "snippet",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "url",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "inscriptionTxid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "merkleProof",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "chain",
            "type": "string"
          }
        ],
        "internalType": "struct OrdinalReassembler.Shard",
        "name": "newShard",
        "type": "tuple"
      }
    ],
    "name": "addShard",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllShards",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "shardId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "snippet",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "url",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "inscriptionTxid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "merkleProof",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "chain",
            "type": "string"
          }
        ],
        "internalType": "struct OrdinalReassembler.Shard[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getShardCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "query",
        "type": "string"
      }
    ],
    "name": "search",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "shardId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "snippet",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "url",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "inscriptionTxid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "merkleProof",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "chain",
            "type": "string"
          }
        ],
        "internalType": "struct OrdinalReassembler.Shard[]",
        "name": "matchedShards",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const LITVM_EXPLORER = 'https://liteforge.explorer.caldera.xyz';
export const LITECOIN_ORDINAL_EXPLORER = 'https://litecoin.ordinalswallet.com/inscription';
