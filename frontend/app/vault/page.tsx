"use client";

import { FormEvent, useMemo, useState } from "react";
import { useEffect } from "react";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import { abis, addresses, deployedChain, deployedChainId } from "@/lib/contracts";
import { TxFeedback } from "@/components/TxFeedback";
import { NetworkBanner } from "@/components/NetworkBanner";

function formatUsdc(value?: bigint) {
  if (value === undefined) return "-";
  return Number(formatUnits(value, 6)).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function VaultPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isWrongNetwork = chainId !== deployedChainId;
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState("10");
  const [lastAction, setLastAction] = useState("none");
  const { data: hash, error, isPending, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: deployedChainId
  });

  const parsedAmount = useMemo(() => {
    try {
      return parseUnits(amount || "0", 6);
    } catch {
      return 0n;
    }
  }, [amount]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: tvl } = useReadContract({
    abi: abis.vault,
    address: addresses.vault,
    functionName: "totalValueLocked"
  });

  const { data: usdcBalance } = useReadContract({
    abi: abis.mockUsdc,
    address: addresses.mockUsdc,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) }
  });

  const { data: shareBalance } = useReadContract({
    abi: abis.vault,
    address: addresses.vault,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) }
  });

  const { data: allowance } = useReadContract({
    abi: abis.mockUsdc,
    address: addresses.mockUsdc,
    functionName: "allowance",
    args: address ? [address, addresses.vault] : undefined,
    query: { enabled: Boolean(address) }
  });
  const currentAllowance = (allowance as bigint | undefined) ?? 0n;
  const currentShares = (shareBalance as bigint | undefined) ?? 0n;
  const isAmountInvalid = parsedAmount <= 0n;
  const canApprove = isConnected && !isWrongNetwork && !isPending && !isAmountInvalid;
  const canDeposit =
    isConnected &&
    !isWrongNetwork &&
    !isPending &&
    !isAmountInvalid &&
    currentAllowance >= parsedAmount;
  const canWithdraw =
    isConnected &&
    !isWrongNetwork &&
    !isPending &&
    !isAmountInvalid &&
    currentShares >= parsedAmount;

  async function approveUsdc(e: FormEvent) {
    e.preventDefault();
    if (!isConnected || isWrongNetwork) return;
    setLastAction("approve");
    await writeContractAsync({
      abi: abis.mockUsdc,
      address: addresses.mockUsdc,
      functionName: "approve",
      args: [addresses.vault, parsedAmount],
      account: address,
      chain: deployedChain,
      chainId: deployedChainId
    });
  }

  async function depositUsdc(e: FormEvent) {
    e.preventDefault();
    if (!isConnected || isWrongNetwork) return;
    setLastAction("deposit");
    await writeContractAsync({
      abi: abis.vault,
      address: addresses.vault,
      functionName: "deposit",
      args: [parsedAmount],
      account: address,
      chain: deployedChain,
      chainId: deployedChainId
    });
  }

  async function withdrawUsdc(e: FormEvent) {
    e.preventDefault();
    if (!isConnected || isWrongNetwork) return;
    setLastAction("withdraw");
    await writeContractAsync({
      abi: abis.vault,
      address: addresses.vault,
      functionName: "withdraw",
      args: [parsedAmount],
      account: address,
      chain: deployedChain,
      chainId: deployedChainId
    });
  }

  return (
    <main className="page">
      <h1>Vault Module</h1>
      <p>Connected address: {mounted ? address ?? "not connected" : "loading..."}</p>
      <NetworkBanner connectedChainId={chainId} expectedChainId={deployedChainId} />

      <section className="panel">
        <h2>Live reads</h2>
        <p>Vault TVL: {formatUsdc(tvl as bigint | undefined)} USDC</p>
        <p>Your MockUSDC: {formatUsdc(usdcBalance as bigint | undefined)} USDC</p>
        <p>Your vault shares: {formatUsdc(shareBalance as bigint | undefined)} gvUSDC</p>
        <p>Allowance to vault: {formatUsdc(allowance as bigint | undefined)} USDC</p>
      </section>

      <section className="panel">
        <h2>Actions</h2>
        <form className="form-row">
          <label>
            Amount (USDC, 6 decimals)
            <input value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          {isAmountInvalid && (
            <p className="note error-note">Enter a positive amount (USDC with 6 decimals).</p>
          )}
          {!isAmountInvalid && currentAllowance < parsedAmount && (
            <p className="note">Approval required before deposit.</p>
          )}
          <div className="buttons">
            <button type="submit" onClick={approveUsdc} disabled={!canApprove}>
              Approve
            </button>
            <button type="submit" onClick={depositUsdc} disabled={!canDeposit}>
              Deposit
            </button>
            <button type="submit" onClick={withdrawUsdc} disabled={!canWithdraw}>
              Withdraw
            </button>
          </div>
        </form>
      </section>
      <TxFeedback
        hash={hash}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error}
        lastAction={lastAction}
        chainId={deployedChainId}
      />
    </main>
  );
}
