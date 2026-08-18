"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useArcWallet } from "@/hooks/useArcWallet";
import { useSurveyFactory, type Survey } from "@/hooks/useSurveyFactory";
import { formatUnits } from "viem";

function formatReward(rewardRaw: bigint): string {
  return formatUnits(rewardRaw, 6);
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Home() {
  const wallet = useArcWallet();
  const factory = useSurveyFactory(wallet.provider);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSurveys() {
      if (!wallet.isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const list = await factory.listSurveys();
        setSurveys(list.filter((s) => s.active));
      } catch (e) {
        console.error("Failed to load surveys:", e);
      } finally {
        setLoading(false);
      }
    }

    loadSurveys();
  }, [wallet.isConnected, factory]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            ARC Survey
          </Link>

          <div className="flex items-center gap-4">
            {wallet.isConnected && (
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {shortenAddress(wallet.address!)}
              </span>
            )}

            {wallet.isConnected ? (
              <button
                onClick={wallet.disconnect}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={wallet.connect}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Active Surveys
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Answer surveys and earn USDC rewards on Arc Testnet
            </p>
          </div>

          {wallet.isConnected && (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Dashboard
              </Link>
              <Link
                href="/create"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Create Survey
              </Link>
            </div>
          )}
        </div>

        {!wallet.isConnected ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-20 dark:border-zinc-700">
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              Connect your wallet to view surveys
            </p>
            <button
              onClick={wallet.connect}
              className="mt-6 rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Connect Wallet
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          </div>
        ) : surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-20 dark:border-zinc-700">
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              No surveys yet. Create the first one!
            </p>
            <Link
              href="/create"
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Create Survey
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey) => (
              <Link
                key={survey.id.toString()}
                href={`/survey/${survey.id.toString()}`}
                className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-400 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {survey.title}
                  </h3>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {survey.description || "No description"}
                </p>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatReward(survey.rewardPerResponse)}
                    </span>{" "}
                    USDC / response
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {survey.responseCount.toString()}/{survey.maxResponses.toString()}{" "}
                    responses
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
