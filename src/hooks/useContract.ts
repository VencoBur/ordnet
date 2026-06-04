import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import { Shard } from '../types';

export function useContract() {
  const { address } = useAccount();
  const [shards, setShards] = useState<Shard[]>([]);
  const [loading, setLoading] = useState(false);
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // Read contract owner
  const { data: contractOwner } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const isOwner = address && contractOwner && address.toLowerCase() === (contractOwner as string).toLowerCase();

  // Load all shards
  const loadAllShards = async () => {
    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      alert('Please update CONTRACT_ADDRESS in src/config/contract.ts with your deployed contract address');
      return;
    }

    setLoading(true);
    try {
      const { data } = await useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getAllShards',
      });

      if (data) {
        setShards(data as Shard[]);
      }
    } catch (error) {
      console.error('Error loading shards:', error);
      alert('Error loading shards from contract. Make sure you are connected to LitVM testnet.');
    } finally {
      setLoading(false);
    }
  };

  // Search shards
  const searchShards = async (query: string) => {
    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      alert('Please update CONTRACT_ADDRESS in src/config/contract.ts with your deployed contract address');
      return;
    }

    setLoading(true);
    try {
      const { data } = await useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'search',
        args: [query],
      });

      if (data) {
        setShards(data as Shard[]);
      }
    } catch (error) {
      console.error('Error searching shards:', error);
      alert('Error searching shards from contract. Make sure you are connected to LitVM testnet.');
    } finally {
      setLoading(false);
    }
  };

  // Add shard (owner only)
  const addShard = async (shardData: Omit<Shard, 'shardId'>) => {
    if (!isOwner) {
      alert('Only the contract owner can add shards');
      return;
    }

    try {
      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'addShard',
        args: [{
          shardId: BigInt(0), // Will be set by contract
          ...shardData
        }],
      });

      alert('Transaction submitted! Waiting for confirmation...');
    } catch (error) {
      console.error('Error adding shard:', error);
      alert('Error adding shard. Make sure you are the contract owner and connected to LitVM testnet.');
    }
  };

  return {
    shards,
    loading: loading || isConfirming,
    loadAllShards,
    searchShards,
    addShard,
    isOwner,
  };
}
