"use client";

import { useState, useEffect, use } from "react";
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

export default function SurveyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const wallet = useArcWallet();
  const usdc = useUSDC(wallet.address, wallet.provider);
  const factory = useSurveyFactory(wallet.provider);
  const { addToast, removeToast } = useToast();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [respondents, setRespondents] = useState<string[]>([]);
  const [hasResponded, setHasResponded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSurvey() {
      try {
        setLoading(true);
        const data = await factory.getSurvey(parseInt(id));
        setSurvey(data);

        const resp = await factory.getRespondents(parseInt(id));
        setRespondents(resp);

        if (wallet.address) {
          const responded = await factory.hasResponded(parseInt(id), wallet.address);
          setHasResponded(responded);
        }
      } catch (e) {
        console.error("Failed to load survey:", e);
      } finally {
        setLoading(false);
      }
    }

    loadSurvey();
  }, [id, wallet.address, factory]);

  const handleSubmitResponse = async () => {
    if (!survey || !wallet.address) return;

    try {
      setSubmitting(true);
      setError(null);

      const loadingId = addToast("loading", "Submitting response...");

      const tx = await factory.submitResponse(parseInt(id));
      removeToast(loadingId);
      addToast("success", "Response submitted! +USDC reward sent", tx);

      setTxHash(tx);

      setHasResponded(true);
      setRespondents([...respondents, wallet.address]);
      setSurvey({
        ...survey,
        responseCount: survey.responseCount + BigInt(1),
      });

      await usdc.refetch();
    } catch (e: any) {
      console.error("Failed to submit response:", e);
      setError(parseTxError(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
            <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              ARC Survey
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-6 py-12">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-20 dark:border-zinc-700">
            <p className="text-lg text-zinc-500 dark:text-zinc-400">Survey not found</p>
            <Link href="/" className="mt-6 text-blue-600 hover:underline">
              Back to surveys
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const responsesLeft = Number(survey.maxResponses - survey.responseCount);
  const isActive = survey.active && responsesLeft > 0;

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
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
          &larr; Back to surveys
        </Link>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 flex items-start justify-between">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {survey.title}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {isActive ? "Active" : "Closed"}
            </span>
          </div>

          {survey.description && (
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              {survey.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Reward per Response</p>
              <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {formatReward(survey.rewardPerResponse)} USDC
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Responses</p>
              <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {survey.responseCount.toString()}/{survey.maxResponses.toString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Responses Left</p>
              <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {responsesLeft}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Created by</p>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {shortenAddress(survey.creator)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Submit Response
          </h2>

          {!wallet.isConnected ? (
            <p className="text-zinc-500 dark:text-zinc-400">
              Connect your wallet to respond
            </p>
          ) : hasResponded ? (
            <div className="rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              You have already responded to this survey
            </div>
          ) : !isActive ? (
            <div className="rounded-lg bg-zinc-100 p-4 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              This survey is no longer accepting responses
            </div>
          ) : (
            <>
              <div className="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                You will receive <strong>{formatReward(survey.rewardPerResponse)} USDC</strong> for
                responding
              </div>

              <button
                onClick={handleSubmitResponse}
                disabled={submitting}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Response"}
              </button>
            </>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {txHash && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
              <p>Response submitted successfully!</p>
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-medium underline hover:no-underline"
              >
                View on ArcScan &rarr;
              </a>
            </div>
          )}
        </div>

        {respondents.length > 0 && (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Respondents ({respondents.length})
            </h2>
            <div className="space-y-2">
              {respondents.map((addr, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-2 dark:bg-zinc-800"
                >
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {shortenAddress(addr)}
                  </span>
                  <a
                    href={`https://testnet.arcscan.app/address/${addr}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
