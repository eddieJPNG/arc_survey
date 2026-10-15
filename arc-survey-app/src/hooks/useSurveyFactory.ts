"use client";

import { useState, useCallback, useMemo } from "react";
import { encodeFunctionData } from "viem";
import { contracts } from "@/lib/contracts";

export type Survey = {
  id: bigint;
  creator: string;
  title: string;
  description: string;
  maxResponses: bigint;
  rewardPerResponse: bigint;
  responseCount: bigint;
  active: boolean;
  createdAt: bigint;
};

const factoryAbi = contracts.surveyFactory.abi;

async function waitForReceipt(
  provider: any,
  txHash: string,
  maxAttempts = 20,
  intervalMs = 500
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const receipt = await provider.request({
      method: "eth_getTransactionReceipt",
      params: [txHash],
    });
    if (receipt) return;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export function useSurveyFactory(provider: any) {
  const [isLoading, setIsLoading] = useState(false);

  const readCall = useCallback(
    async (functionName: string, args: unknown[] = []): Promise<string> => {
      if (!provider) throw new Error("Wallet not connected");

      const data = encodeFunctionData({
        abi: factoryAbi,
        functionName,
        args: args as any,
      });

      const result = await provider.request({
        method: "eth_call",
        params: [{ to: contracts.surveyFactory.address, data }, "latest"],
      });

      return result as string;
    },
    [provider]
  );

  const writeCall = useCallback(
    async (functionName: string, args: unknown[] = []): Promise<string> => {
      if (!provider) throw new Error("Wallet not connected");

      const accounts = (await provider.request({
        method: "eth_accounts",
      })) as string[];

      const data = encodeFunctionData({
        abi: factoryAbi,
        functionName,
        args: args as any,
      });

      const txHash = (await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: accounts[0], to: contracts.surveyVault.address, data }],
      })) as string;

      await waitForReceipt(provider, txHash);

      return txHash;
    },
    [provider]
  );

  const createSurvey = useCallback(
    async (
      title: string,
      description: string,
      maxResponses: number,
      rewardPerResponse: string
    ): Promise<{ txHash: string; surveyId: bigint }> => {
      const rewardRaw = BigInt(Math.floor(parseFloat(rewardPerResponse) * 1e6));

      const txHash = await writeCall("createSurvey", [
        title,
        description,
        BigInt(maxResponses),
        rewardRaw,
      ]);

      await waitForReceipt(provider, txHash);

      const countHex = await readCall("surveyCount", []);
      const surveyId = BigInt(countHex);

      return { txHash, surveyId };
    },
    [writeCall, readCall]
  );

  const fundSurvey = useCallback(
    async (surveyId: number | bigint, amount: bigint, rewardPerResponse: bigint): Promise<string> => {
      if (!provider) throw new Error("Wallet not connected");

      const accounts = (await provider.request({
        method: "eth_accounts",
      })) as string[];

      const data = encodeFunctionData({
        abi: contracts.surveyVault.abi,
        functionName: "fundSurvey",
        args: [BigInt(surveyId), amount, rewardPerResponse],
      });

      const txHash = (await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: accounts[0], to: contracts.surveyVault.address, data }],
      })) as string;

      return txHash;
    },
    [provider]
  );

  const submitResponse = useCallback(
    async (surveyId: number | bigint): Promise<string> => {
      const txHash = await writeCall("submitResponse", [BigInt(surveyId)]);
      return txHash;
    },
    [writeCall]
  );

  const getSurvey = useCallback(
    async (surveyId: number | bigint): Promise<Survey> => {
      const hex = await readCall("getSurvey", [BigInt(surveyId)]);
      return decodeSurvey(hex);
    },
    [readCall]
  );

  const listSurveys = useCallback(async (): Promise<Survey[]> => {
    const countHex = await readCall("surveyCount", []);
    const count = Number(BigInt(countHex));

    const surveys: Survey[] = [];
    for (let i = 1; i <= count; i++) {
      try {
        const survey = await getSurvey(i);
        surveys.push(survey);
      } catch (e) {
        console.error(`Failed to fetch survey ${i}:`, e);
      }
    }

    return surveys;
  }, [readCall, getSurvey]);

  const getRespondents = useCallback(
    async (surveyId: number | bigint): Promise<string[]> => {
      const hex = await readCall("getRespondents", [BigInt(surveyId)]);
      return decodeAddressArray(hex);
    },
    [readCall]
  );

  const hasResponded = useCallback(
    async (surveyId: number | bigint, address: string): Promise<boolean> => {
      const hex = await readCall("hasResponded", [BigInt(surveyId), address]);
      return BigInt(hex) !== BigInt(0);
    },
    [readCall]
  );

  const getSurveyBalance = useCallback(
    async (surveyId: number | bigint): Promise<bigint> => {
      const data = encodeFunctionData({
        abi: contracts.surveyVault.abi,
        functionName: "getBalance",
        args: [BigInt(surveyId)],
      });

      const result = await provider.request({
        method: "eth_call",
        params: [{ to: contracts.surveyVault.address, data }, "latest"],
      });

      return BigInt(result);
    },
    [provider]
  );

  const withdrawRemaining = useCallback(
    async (surveyId: number | bigint): Promise<string> => {
      if (!provider) throw new Error("Wallet not connected");

      const accounts = (await provider.request({
        method: "eth_accounts",
      })) as string[];

      const data = encodeFunctionData({
        abi: contracts.surveyVault.abi,
        functionName: "withdrawRemaining",
        args: [BigInt(surveyId)],
      });

      const txHash = (await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: accounts[0], to: contracts.surveyVault.address, data }],
      })) as string;

      return txHash;
    },
    [provider]
  );

  return useMemo(() => ({
    isLoading,
    createSurvey,
    fundSurvey,
    submitResponse,
    getSurvey,
    listSurveys,
    getRespondents,
    hasResponded,
    getSurveyBalance,
    withdrawRemaining,
  }), [createSurvey, fundSurvey, submitResponse, getSurvey, listSurveys, getRespondents, hasResponded, getSurveyBalance, withdrawRemaining]);
}

function decodeSurvey(hex: string): Survey {
  const raw = hex.startsWith("0x") ? hex.slice(2) : hex;
  const data = raw;

  if (data.length < 640) {
    return {
      id: BigInt(0),
      creator: "0x0000000000000000000000000000000000000000",
      title: "",
      description: "",
      maxResponses: BigInt(0),
      rewardPerResponse: BigInt(0),
      responseCount: BigInt(0),
      active: false,
      createdAt: BigInt(0),
    };
  }

  const readSlot = (offset: number, size: number = 64): string =>
    data.slice(offset, offset + size);

  const readUint = (offset: number): bigint => {
    const slot = readSlot(offset);
    if (!/^[0-9a-fA-F]+$/.test(slot) || slot.length < 64) return BigInt(0);
    return BigInt("0x" + slot);
  };

  const readAddress = (offset: number): string => {
    const slot = readSlot(offset);
    if (slot.length < 64) return "0x0000000000000000000000000000000000000000";
    return "0x" + slot.slice(24);
  };

  const readBool = (offset: number): boolean =>
    readSlot(offset) !== "0".repeat(64);

  let cursor = 0;

  const id = readUint(cursor);
  cursor += 64;

  const creator = readAddress(cursor);
  cursor += 64;

  const titleOffset = Number(readUint(cursor));
  cursor += 64;

  const descriptionOffset = Number(readUint(cursor));
  cursor += 64;

  const maxResponses = readUint(cursor);
  cursor += 64;

  const rewardPerResponse = readUint(cursor);
  cursor += 64;

  const responseCount = readUint(cursor);
  cursor += 64;

  const active = readBool(cursor);
  cursor += 64;

  const createdAt = readUint(cursor);

  const title = decodeString(data, titleOffset);
  const description = decodeString(data, descriptionOffset);

  return {
    id,
    creator,
    title,
    description,
    maxResponses,
    rewardPerResponse,
    responseCount,
    active,
    createdAt,
  };
}

function decodeString(hex: string, offset: number): string {
  const dataOffset = offset * 2;
  if (dataOffset + 64 > hex.length) return "";
  const lengthHex = hex.slice(dataOffset, dataOffset + 64);
  if (!/^[0-9a-fA-F]+$/.test(lengthHex)) return "";
  const length = Number(BigInt("0x" + lengthHex));
  if (length <= 0 || length > 10000) return "";
  const bytesStart = dataOffset + 64;
  const bytesHex = hex.slice(bytesStart, bytesStart + length * 2);

  let str = "";
  for (let i = 0; i < bytesHex.length; i += 2) {
    const code = parseInt(bytesHex.slice(i, i + 2), 16);
    if (code > 0) str += String.fromCharCode(code);
  }
  return str;
}

function decodeAddressArray(hex: string): string[] {
  const raw = hex.startsWith("0x") ? hex.slice(2) : hex;
  const data = raw;

  if (data.length < 128) return [];

  const arrayOffset = Number(BigInt("0x" + data.slice(0, 64))) * 2;
  const length = Number(BigInt("0x" + data.slice(arrayOffset, arrayOffset + 64)));
  const addresses: string[] = [];

  for (let i = 0; i < length; i++) {
    const offset = arrayOffset + 64 + i * 64;
    addresses.push("0x" + data.slice(offset + 24, offset + 64));
  }

  return addresses;
}
