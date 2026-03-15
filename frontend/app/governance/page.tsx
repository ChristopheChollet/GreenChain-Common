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

type ProposalTuple = [string, bigint, bigint, bigint, boolean];

export default function GovernancePage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const isWrongNetwork = chainId !== deployedChainId;
  const [description, setDescription] = useState("Allocate more capital to grid flexibility");
  const [duration, setDuration] = useState("86400");
  const [proposalIdInput, setProposalIdInput] = useState("0");
  const [lastAction, setLastAction] = useState("none");
  const { data: hash, error, isPending, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: deployedChainId
  });

  const proposalId = useMemo(() => {
    try {
      return BigInt(proposalIdInput || "0");
    } catch {
      return 0n;
    }
  }, [proposalIdInput]);
  const durationBigint = useMemo(() => {
    try {
      return BigInt(duration || "0");
    } catch {
      return 0n;
    }
  }, [duration]);
  const isProposeInvalid = description.trim().length === 0 || durationBigint <= 0n;

  const { data: proposalCount } = useReadContract({
    abi: abis.dao,
    address: addresses.dao,
    functionName: "proposalCount"
  });
  const proposalCountValue = proposalCount as bigint | undefined;

  const { data: latestProposal } = useReadContract({
    abi: abis.dao,
    address: addresses.dao,
    functionName: "proposals",
    args:
      proposalCountValue !== undefined && proposalCountValue > 0n
        ? [proposalCountValue - 1n]
        : undefined,
    query: { enabled: proposalCountValue !== undefined && proposalCountValue > 0n }
  });

  async function propose(e: FormEvent) {
    e.preventDefault();
    if (isWrongNetwork || !address) return;
    setLastAction("propose");
    await writeContractAsync({
      abi: abis.dao,
      address: addresses.dao,
      functionName: "propose",
      args: [description, durationBigint],
      account: address,
      chain: deployedChain,
      chainId: deployedChainId
    });
  }

  async function vote(support: boolean) {
    if (isWrongNetwork || !address) return;
    setLastAction(support ? "vote-yes" : "vote-no");
    await writeContractAsync({
      abi: abis.dao,
      address: addresses.dao,
      functionName: "vote",
      args: [proposalId, support],
      account: address,
      chain: deployedChain,
      chainId: deployedChainId
    });
  }

  async function execute() {
    if (isWrongNetwork || !address) return;
    setLastAction("execute");
    await writeContractAsync({
      abi: abis.dao,
      address: addresses.dao,
      functionName: "execute",
      args: [proposalId],
      account: address,
      chain: deployedChain,
      chainId: deployedChainId
    });
  }

  const parsedLatest = latestProposal as ProposalTuple | undefined;

  return (
    <main className="page">
      <h1>Governance Module</h1>
      <NetworkBanner connectedChainId={chainId} expectedChainId={deployedChainId} />
      <section className="panel">
        <h2>Live reads</h2>
        <p>Proposal count: {String(proposalCountValue ?? "-")}</p>
        <p>Latest proposal: {parsedLatest ? parsedLatest[0] : "none"}</p>
        <p>
          Latest votes: yes={parsedLatest ? String(parsedLatest[1]) : "-"} / no=
          {parsedLatest ? String(parsedLatest[2]) : "-"}
        </p>
      </section>

      <section className="panel">
        <h2>Create proposal (owner only)</h2>
        <form className="form-grid" onSubmit={propose}>
          <label>
            Description
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label>
            Duration (seconds)
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </label>
          {isProposeInvalid && (
            <p className="note error-note">
              Invalid proposal input: description required and duration must be positive.
            </p>
          )}
          <button type="submit" disabled={!address || isWrongNetwork || isPending || isProposeInvalid}>
            Propose
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Vote / execute</h2>
        <div className="form-row">
          <label>
            Proposal id
            <input
              type="number"
              value={proposalIdInput}
              onChange={(e) => setProposalIdInput(e.target.value)}
            />
          </label>
          <div className="buttons">
            <button type="button" onClick={() => vote(true)} disabled={!address || isWrongNetwork || isPending}>
              Vote YES
            </button>
            <button type="button" onClick={() => vote(false)} disabled={!address || isWrongNetwork || isPending}>
              Vote NO
            </button>
            <button type="button" onClick={execute} disabled={!address || isWrongNetwork || isPending}>
              Execute
            </button>
          </div>
        </div>
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
