"use client";

import { FormEvent, useMemo, useState } from "react";
import { formatEther } from "viem";
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

export default function MarketPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const isWrongNetwork = chainId !== deployedChainId;
  const now = Math.floor(Date.now() / 1000);
  const [startTime, setStartTime] = useState(String(now + 300));
  const [endTime, setEndTime] = useState(String(now + 3600));
  const [energyWh, setEnergyWh] = useState("2500");
  const [pricePerWhWei, setPricePerWhWei] = useState("10000000000");
  const [slotIdInput, setSlotIdInput] = useState("0");
  const [lastAction, setLastAction] = useState("none");
  const { data: hash, error, isPending, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: deployedChainId
  });

  const slotId = useMemo(() => {
    try {
      return BigInt(slotIdInput || "0");
    } catch {
      return 0n;
    }
  }, [slotIdInput]);
  const isCreateInputInvalid =
    Number.isNaN(Number(startTime)) ||
    Number.isNaN(Number(endTime)) ||
    Number(endTime) <= Number(startTime) ||
    !Number.isFinite(Number(startTime)) ||
    !Number.isFinite(Number(endTime)) ||
    !energyWh ||
    !pricePerWhWei;

  const { data: nextSlotId } = useReadContract({
    abi: abis.market,
    address: addresses.market,
    functionName: "nextSlotId"
  });

  const { data: quote } = useReadContract({
    abi: abis.market,
    address: addresses.market,
    functionName: "quoteMatch",
    args: [slotId],
    query: { enabled: nextSlotId !== undefined && slotId < (nextSlotId as bigint) }
  });

  const { data: slotData } = useReadContract({
    abi: abis.market,
    address: addresses.market,
    functionName: "getSlot",
    args: [slotId],
    query: { enabled: nextSlotId !== undefined && slotId < (nextSlotId as bigint) }
  });

  async function createSlot(e: FormEvent) {
    e.preventDefault();
    if (isWrongNetwork || !address) return;
    setLastAction("createSlot");
    await writeContractAsync({
      abi: abis.market,
      address: addresses.market,
      functionName: "createSlot",
      args: [Number(startTime), Number(endTime), BigInt(energyWh), BigInt(pricePerWhWei)],
      account: address,
      chain: deployedChain,
      chainId: deployedChainId
    });
  }

  async function matchSlot(e: FormEvent) {
    e.preventDefault();
    if (isWrongNetwork || !address) return;
    const quoted = (quote as [bigint, bigint] | undefined)?.[0] ?? 0n;
    setLastAction("matchSlot");
    await writeContractAsync({
      abi: abis.market,
      address: addresses.market,
      functionName: "matchSlot",
      args: [slotId],
      value: quoted,
      account: address,
      chain: deployedChain,
      chainId: deployedChainId
    });
  }

  async function cancelSlot(e: FormEvent) {
    e.preventDefault();
    if (isWrongNetwork || !address) return;
    setLastAction("cancelSlot");
    await writeContractAsync({
      abi: abis.market,
      address: addresses.market,
      functionName: "cancelSlot",
      args: [slotId],
      account: address,
      chain: deployedChain,
      chainId: deployedChainId
    });
  }

  return (
    <main className="page">
      <h1>Market Module</h1>
      <NetworkBanner connectedChainId={chainId} expectedChainId={deployedChainId} />

      <section className="panel">
        <h2>Live reads</h2>
        <p>Next slot id: {String(nextSlotId ?? "-")}</p>
        <p>
          Quote for slot #{slotIdInput}:{" "}
          {quote ? `${formatEther((quote as [bigint, bigint])[0])} ETH` : "n/a"}
        </p>
        <p>Oracle factor (bps): {quote ? String((quote as [bigint, bigint])[1]) : "n/a"}</p>
        <p>
          Slot status:{" "}
          {slotData ? String((slotData as { status: number }).status) : "n/a (invalid id or empty)"}
        </p>
      </section>

      <section className="panel">
        <h2>Create slot</h2>
        <form className="form-grid" onSubmit={createSlot}>
          <label>
            Start timestamp
            <input type="number" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </label>
          <label>
            End timestamp
            <input type="number" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </label>
          <label>
            Energy (Wh)
            <input type="number" value={energyWh} onChange={(e) => setEnergyWh(e.target.value)} />
          </label>
          <label>
            Price per Wh (wei)
            <input
              type="number"
              value={pricePerWhWei}
              onChange={(e) => setPricePerWhWei(e.target.value)}
            />
          </label>
          {isCreateInputInvalid && (
            <p className="note error-note">Invalid slot input: check time window and numeric values.</p>
          )}
          <button type="submit" disabled={!address || isWrongNetwork || isPending || isCreateInputInvalid}>
            Create slot
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Match / cancel</h2>
        <form className="form-row">
          <label>
            Slot id
            <input type="number" value={slotIdInput} onChange={(e) => setSlotIdInput(e.target.value)} />
          </label>
          <div className="buttons">
            <button type="submit" onClick={matchSlot} disabled={!address || isWrongNetwork || isPending}>
              Match slot
            </button>
            <button type="submit" onClick={cancelSlot} disabled={!address || isWrongNetwork || isPending}>
              Cancel slot
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
