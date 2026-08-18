"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useArcWallet } from "@/hooks/useArcWallet";
import { useUSDC } from "@/hooks/useUSDC";
import { useSurveyFactory } from "@/hooks/useSurveyFactory";
import { useToast, parseTxError } from "@/components/Toast";
import { contracts } from "@/lib/contracts";

export default function CreateSurvey() {
  const router = useRouter();
  const wallet = useArcWallet();
  const usdc = useUSDC(wallet.address, wallet.provider);
  const factory = useSurveyFactory(wallet.provider);
  const { addToast, removeToast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxResponses, setMaxResponses] = useState("");
  const [rewardPerResponse, setRewardPerResponse] = useState("");
  const [step, setStep] = useState<"idle" | "approving" | "creating" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const totalReward =
    maxResponses && rewardPerResponse
      ? (parseFloat(maxResponses) * parseFloat(rewardPerResponse)).toFixed(2)
      : "0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.isConnected || !wallet.address) {
      setError("Please connect your wallet first");
      return;
    }

    setError(null);

    try {
      setStep("approving");
      const loadingId = addToast("loading", "Approving USDC...");

      const approveTx = await usdc.approve(
        contracts.surveyVault.address,
        totalReward
      );
      removeToast(loadingId);
      addToast("success", "USDC approved!", approveTx);

      setStep("creating");
      const loadingId2 = addToast("loading", "Creating survey...");

      const createTx = await factory.createSurvey(
        title,
        description,
        parseInt(maxResponses),
        rewardPerResponse
      );
      removeToast(loadingId2);
      addToast("success", "Survey created!", createTx);

      setStep("done");
      router.push("/");
    } catch (e: any) {
      console.error("Failed to create survey:", e);
      setError(parseTxError(e));
      setStep("idle");
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

        <main className="mx-auto max-w-2xl px-6 py-12">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-20 dark:border-zinc-700">
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              Please connect your wallet to create a survey
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
              {wallet.address!.slice(0, 6)}...{wallet.address!.slice(-4)}
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

      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            &larr; Back to surveys
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Create Survey
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Set up your survey and fund it with USDC rewards
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="Enter survey title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="Describe your survey"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="maxResponses" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Max Responses
              </label>
              <input
                id="maxResponses"
                type="number"
                min="1"
                value={maxResponses}
                onChange={(e) => setMaxResponses(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="10"
              />
            </div>

            <div>
              <label htmlFor="reward" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Reward per Response (USDC)
              </label>
              <input
                id="reward"
                type="number"
                min="0.01"
                step="0.01"
                value={rewardPerResponse}
                onChange={(e) => setRewardPerResponse(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="1.00"
              />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Your USDC Balance
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {usdc.balance} USDC
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Total Funding Required
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {totalReward} USDC
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={step !== "idle" || !title || !maxResponses || !rewardPerResponse}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {step === "idle" && "Create Survey"}
            {step === "approving" && "Approving USDC..."}
            {step === "creating" && "Creating Survey..."}
            {step === "done" && "Done! Redirecting..."}
          </button>
        </form>
      </main>
    </div>
  );
}
