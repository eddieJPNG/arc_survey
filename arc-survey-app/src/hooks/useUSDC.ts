"use client";

import { useState, useCallback, useEffect } from "react";
import { parseUnits, formatUnits, encodeFunctionData } from "viem";
import { USDC_ADDRESS } from "@/lib/contracts";
import { erc20Abi } from "viem";

const USDC_DECIMALS = 6;

export function useUSDC(address: string | null, provider: any) {
  const [balance, setBalance] = useState<string>("0");
  const [balanceRaw, setBalanceRaw] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!provider || !address) {
      setBalance("0");
      setBalanceRaw(BigInt(0));
      return;
    }

    setIsLoading(true);
    try {
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });
      const result = await provider.request({
        method: "eth_call",
        params: [{ to: USDC_ADDRESS, data }, "latest"],
      });
      const raw = BigInt(result);
      setBalanceRaw(raw);
      setBalance(formatUnits(raw, USDC_DECIMALS));
    } catch (e) {
      console.error("Failed to fetch USDC balance:", e);
    } finally {
      setIsLoading(false);
    }
  }, [provider, address]);

  const approve = useCallback(
    async (spender: string, amount: string): Promise<string> => {
      if (!provider || !address) throw new Error("Wallet not connected");

      const amountRaw = parseUnits(amount, USDC_DECIMALS);
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [spender as `0x${string}`, amountRaw],
      });

      const txHash = (await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: address, to: USDC_ADDRESS, data }],
      })) as string;

      return txHash;
    },
    [provider, address]
  );

  const allowance = useCallback(
    async (spender: string): Promise<bigint> => {
      if (!provider || !address) throw new Error("Wallet not connected");

      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "allowance",
        args: [address as `0x${string}`, spender as `0x${string}`],
      });
      const result = await provider.request({
        method: "eth_call",
        params: [{ to: USDC_ADDRESS, data }, "latest"],
      });
      return BigInt(result);
    },
    [provider, address]
  );

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    balanceRaw,
    isLoading,
    approve,
    allowance,
    refetch: fetchBalance,
  };
}
