import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

export function useContract() {
  const { data: allShards, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getAllShards',
  });

  const searchShards = async (_query: string) => {
    // This is a simplified version - you can improve it later
    return allShards || [];
  };

  return {
    allShards: allShards || [],
    isLoading,
    error,
    refetch,
    searchShards,
  };
}