"use client";

import { useState, useCallback, useEffect } from "react";
import { arcTestnet } from "@/lib/chains";

type EIP6963ProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};

type EIP6963ProviderDetail = {
  info: EIP6963ProviderInfo;
  provider: any;
};

type EIP1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

type ArcWalletState = {
  address: string | null;
  isConnected: boolean;
  provider: EIP1193Provider | null;
  chain: number | null;
};

export function useArcWallet() {
  const [state, setState] = useState<ArcWalletState>({
    address: null,
    isConnected: false,
    provider: null,
    chain: null,
  });

  const discoverProviders = useCallback(async (): Promise<EIP6963ProviderDetail[]> => {
    if (typeof window === "undefined") return [];

    const providers = new Map<string, EIP6963ProviderDetail>();

    const handleAnnounce = (e: WindowEventMap["eip6963:announceProvider"]) => {
      providers.set(e.detail.info.uuid, e.detail);
    };

    window.addEventListener("eip6963:announceProvider", handleAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    await new Promise((r) => setTimeout(r, 250));

    window.removeEventListener("eip6963:announceProvider", handleAnnounce);

    return [...providers.values()];
  }, []);

  const switchToArcTestnet = useCallback(async (provider: EIP1193Provider) => {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${arcTestnet.id.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${arcTestnet.id.toString(16)}`,
              chainName: arcTestnet.name,
              rpcUrls: arcTestnet.rpcUrls.default.http,
              blockExplorerUrls: [arcTestnet.blockExplorers.default.url],
              nativeCurrency: arcTestnet.nativeCurrency,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }, []);

  const connect = useCallback(async () => {
    const discovered = await discoverProviders();
    if (discovered.length === 0) {
      throw new Error("No EIP-6963 wallet found");
    }

    const selected = discovered.find(
      (p) => p.info.rdns === "io.metamask" || p.info.name === "MetaMask"
    ) ?? discovered[0];

    const provider = selected.provider;

    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];

    await switchToArcTestnet(provider);

    const chainId = (await provider.request({
      method: "eth_chainId",
    })) as string;

    setState({
      address: accounts[0] ?? null,
      isConnected: true,
      provider,
      chain: parseInt(chainId, 16),
    });
  }, [discoverProviders, switchToArcTestnet]);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      provider: null,
      chain: null,
    });
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      const discovered = await discoverProviders();
      if (discovered.length === 0) return;

      const selected = discovered.find(
        (p) => p.info.rdns === "io.metamask" || p.info.name === "MetaMask"
      ) ?? discovered[0];

      try {
        const accounts = (await selected.provider.request({
          method: "eth_accounts",
        })) as string[];

        if (accounts.length > 0) {
          const chainId = (await selected.provider.request({
            method: "eth_chainId",
          })) as string;

          setState({
            address: accounts[0],
            isConnected: true,
            provider: selected.provider,
            chain: parseInt(chainId, 16),
          });
        }
      } catch {}
    };

    checkConnection();
  }, [discoverProviders]);

  return {
    ...state,
    connect,
    disconnect,
  };
}
