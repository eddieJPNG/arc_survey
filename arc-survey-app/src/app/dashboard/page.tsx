"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useArcWallet } from "@/hooks/useArcWallet";
import { useUSDC } from "@/hooks/useUSDC";
import { useSurveyFactory, type Survey } from "@/hooks/useSurveyFactory";
import { useToast, parseTxError } from "@/components/Toast";
import { formatUnits } from "viem";

function formatReward(rewardRaw: bigint): string {
  return formatUnits(rewardRaw, 6);
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

type SurveyWithBalance = Survey & { balance: bigint };

export default function Dashboard() {
  const wallet = useArcWallet();
  const usdc = useUSDC(wallet.address, wallet.provider);
  const factory = useSurveyFactory(wallet.provider);
  const { addToast, removeToast } = useToast();

  const [surveys, setSurveys] = useState<SurveyWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSurveys() {
      if (!wallet.isConnected || !wallet.address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allSurveys = await factory.listSurveys();
        const mySurveys = allSurveys.filter(
          (s) => s.creator.toLowerCase() === wallet.address!.toLowerCase()
        );

        const withBalances: SurveyWithBalance[] = await Promise.all(
          mySurveys.map(async (s) => {
            const balance = await factory.getSurveyBalance(s.id);
            return { ...s, balance };
          })
        );

        setSurveys(withBalances);
      } catch (e) {
        console.error("Failed to load surveys:", e);
      } finally {
        setLoading(false);
      }
    }

    loadSurveys();
  }, [wallet.isConnected, wallet.address, factory]);

  const handleWithdraw = async (surveyId: bigint) => {
    try {
      setWithdrawing(Number(surveyId));
      setError(null);

      const loadingId = addToast("loading", "Withdrawing funds...");

      const tx = await factory.withdrawRemaining(surveyId);
      removeToast(loadingId);
      addToast("success", "Funds withdrawn!", tx);

      setTxHash(tx);

      setSurveys((prev) =>
        prev.map((s) => (s.id === surveyId ? { ...s, balance: BigInt(0) } : s))
      );

      await usdc.refetch();
    } catch (e: any) {
      console.error("Failed to withdraw:", e);
      setError(parseTxError(e));
    } finally {
      setWithdrawing(null);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              ARC Survey
            </Link>
            <button
              onClick={wallet.connect}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Connect Wallet
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-20 dark:border-zinc-700">
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              Please connect your wallet to view your surveys
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            ARC Survey
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {shortenAddress(wallet.address!)}
            </span>
            <button
              onClick={wallet.disconnect}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Disconnect
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Creator Dashboard
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Manage your surveys and withdraw remaining funds
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">USDC Balance</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {usdc.balance} USDC
              </p>
            </div>
            <Link
              href="/create"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Create Survey
            </Link>
          </div>
        </div>

        {txHash && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
            Withdraw successful!{" "}
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:no-underline"
            >
              View on ArcScan &rarr;
            </a>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          </div>
        ) : surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-20 dark:border-zinc-700">
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              You haven&apos;t created any surveys yet
            </p>
            <Link
              href="/create"
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Create Your First Survey
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {surveys.map((survey) => (
              <div
                key={survey.id.toString()}
                className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {survey.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          survey.active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {survey.active ? "Active" : "Closed"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {survey.description || "No description"}
                    </p>

                    <div className="mt-4 grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Reward</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {formatReward(survey.rewardPerResponse)} USDC
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Responses</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {survey.responseCount.toString()}/{survey.maxResponses.toString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Balance</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {formatReward(survey.balance)} USDC
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Distributed</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {formatReward(
                            survey.balance +
                              survey.rewardPerResponse * survey.responseCount
                          )}{" "}
                          USDC
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <Link
                      href={`/survey/${survey.id.toString()}`}
                      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      View
                    </Link>

                    {survey.balance > BigInt(0) && (
                      <button
                        onClick={() => handleWithdraw(survey.id)}
                        disabled={withdrawing === Number(survey.id)}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                      >
                        {withdrawing === Number(survey.id)
                          ? "Withdrawing..."
                          : "Withdraw"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
