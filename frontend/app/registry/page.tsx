"use client";

import { FormEvent, useMemo, useState } from "react";
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

export default function RegistryPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const isWrongNetwork = chainId !== deployedChainId;
  const [issueTo, setIssueTo] = useState<string>(addresses.dao);
  const [tokenId, setTokenId] = useState("1");
  const [amount, setAmount] = useState("1");
  const [tokenUri, setTokenUri] = useState("ipfs://green-rec-demo");
  const [retireReason, setRetireReason] = useState("retired for impact accounting");
  const [lastAction, setLastAction] = useState("none");
  const { data: hash, error, isPending, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: deployedChainId
  });

  const tokenIdBigint = useMemo(() => {
    try {
      return BigInt(tokenId || "0");
    } catch {
      return 0n;
    }
  }, [tokenId]);
  const amountBigint = useMemo(() => {
    try {
      return BigInt(amount || "0");
    } catch {
      return 0n;
    }
  }, [amount]);
  const isInputInvalid =
    !issueTo.startsWith("0x") || issueTo.length !== 42 || tokenIdBigint < 0n || amountBigint <= 0n;

  const { data: owner } = useReadContract({
    abi: abis.registry,
    address: addresses.registry,
    functionName: "owner"
  });

  const { data: myBalance } = useReadContract({
    abi: abis.registry,
    address: addresses.registry,
    functionName: "balanceOf",
    args: address ? [address, tokenIdBigint] : undefined,
    query: { enabled: Boolean(address) }
  });

  async function issue(e: FormEvent) {
    e.preventDefault();
    if (isWrongNetwork || !address) return;
    setLastAction("issue");
    await writeContractAsync({
      abi: abis.registry,
      address: addresses.registry,
      functionName: "issue",
      args: [issueTo as `0x${string}`, tokenIdBigint, amountBigint, tokenUri],
      account: address,
      chain: deployedChain,
      chainId: deployedChainId
    });
  }

  async function retire(e: FormEvent) {
    e.preventDefault();
    if (isWrongNetwork || !address) return;
    setLastAction("retire");
    await writeContractAsync({
      abi: abis.registry,
      address: addresses.registry,
      functionName: "retire",
      args: [tokenIdBigint, amountBigint, retireReason],
      account: address,
      chain: deployedChain,
      chainId: deployedChainId
    });
  }

  return (
    <main className="page">
      <h1>Registry Module</h1>
      <NetworkBanner connectedChainId={chainId} expectedChainId={deployedChainId} />
      <section className="panel">
        <h2>Live reads</h2>
        <p>Registry owner: {String(owner ?? "-")}</p>
        <p>
          Your REC balance for token #{tokenId}: {String(myBalance ?? "-")}
        </p>
      </section>

      <section className="panel">
        <h2>Issue REC (owner only)</h2>
        <form className="form-grid" onSubmit={issue}>
          <label>
            Recipient
            <input value={issueTo} onChange={(e) => setIssueTo(e.target.value)} />
          </label>
          <label>
            Token id
            <input type="number" value={tokenId} onChange={(e) => setTokenId(e.target.value)} />
          </label>
          <label>
            Amount
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label>
            Token URI
            <input value={tokenUri} onChange={(e) => setTokenUri(e.target.value)} />
          </label>
          {isInputInvalid && (
            <p className="note error-note">
              Invalid issue input: recipient must be a valid address and amount must be positive.
            </p>
          )}
          <button type="submit" disabled={!address || isWrongNetwork || isPending || isInputInvalid}>
            Issue
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Retire REC</h2>
        <form className="form-grid" onSubmit={retire}>
          <label>
            Token id
            <input type="number" value={tokenId} onChange={(e) => setTokenId(e.target.value)} />
          </label>
          <label>
            Amount
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label>
            Reason
            <input value={retireReason} onChange={(e) => setRetireReason(e.target.value)} />
          </label>
          <button type="submit" disabled={!address || isWrongNetwork || isPending || amountBigint <= 0n}>
            Retire
          </button>
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
