"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEther, formatUnits, parseAbiItem } from "viem";
import type { AbiEvent } from "viem";
import { useChainId, usePublicClient, useReadContract } from "wagmi";
import {
  abis,
  addresses,
  deployedChainId,
  deployedNetwork,
  hasCarbonCredits
} from "@/lib/contracts";
import { NetworkBanner } from "@/components/NetworkBanner";

const LOG_CHUNK_SIZE = BigInt(50_000);
const RANGE_OPTIONS = [
  { key: "all", label: "All", blocks: BigInt(0) },
  { key: "1h", label: "1H", blocks: BigInt(300) },
  { key: "24h", label: "24H", blocks: BigInt(7200) },
  { key: "7d", label: "7D", blocks: BigInt(50400) }
] as const;

type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];
type ActivityItem = {
  id: string;
  label: string;
  value: string;
  txHash?: `0x${string}`;
  blockNumber?: bigint;
};

async function getLogsChunked(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  params: {
    address: `0x${string}`;
    event: AbiEvent;
    fromBlock: bigint;
    toBlock: bigint;
  }
) {
  const logs = [];
  let fromBlock = params.fromBlock;
  const latestBlock = params.toBlock;

  while (fromBlock <= latestBlock) {
    const toBlock = fromBlock + LOG_CHUNK_SIZE > latestBlock ? latestBlock : fromBlock + LOG_CHUNK_SIZE;
    const chunkLogs = await publicClient.getLogs({
      address: params.address,
      event: params.event,
      fromBlock,
      toBlock
    });
    logs.push(...chunkLogs);
    fromBlock = toBlock + BigInt(1);
  }

  return logs;
}

const modules = [
  {
    href: "/vault",
    title: "GreenVault",
    description: "USDC vault deposit/withdraw flow",
    step: "1",
    outcome: "Capital enters the protocol"
  },
  {
    href: "/market",
    title: "Grid Flex Market",
    description: "Create and match flexibility slots",
    step: "2",
    outcome: "Energy flexibility gets financed"
  },
  {
    href: "/registry",
    title: "RECs Registry",
    description: "Issue and retire environmental certificates",
    step: "3",
    outcome: "Environmental impact is tracked"
  },
  {
    href: "/governance",
    title: "Energy DAO",
    description: "Create proposals and track voting",
    step: "4",
    outcome: "Allocation rules can be governed"
  }
];

type HealthRowProps = {
  label: string;
  isOk: boolean;
};

function HealthRow({ label, isOk }: HealthRowProps) {
  return (
    <div className="health-row">
      <span>{label}</span>
      <span className={isOk ? "status-badge status-ok" : "status-badge status-error"}>
        {isOk ? "OK" : "Error"}
      </span>
    </div>
  );
}

export default function HomePage() {
  const connectedChainId = useChainId();
  const publicClient = usePublicClient({ chainId: deployedChainId });
  const [range, setRange] = useState<RangeKey>("all");
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [isLoadingImpact, setIsLoadingImpact] = useState(false);
  const [impactError, setImpactError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("never");
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [impact, setImpact] = useState({
    depositedUsdc: BigInt(0),
    matchedEth: BigInt(0),
    retiredRecs: BigInt(0),
    carbonCreditsMinted: BigInt(0),
    votes: 0
  });

  const { data: tvl } = useReadContract({
    chainId: deployedChainId,
    abi: abis.vault,
    address: addresses.vault,
    functionName: "totalValueLocked"
  });

  const { data: nextSlotId } = useReadContract({
    chainId: deployedChainId,
    abi: abis.market,
    address: addresses.market,
    functionName: "nextSlotId"
  });

  const { data: proposalCount } = useReadContract({
    chainId: deployedChainId,
    abi: abis.dao,
    address: addresses.dao,
    functionName: "proposalCount"
  });

  const { data: registryOwner } = useReadContract({
    chainId: deployedChainId,
    abi: abis.registry,
    address: addresses.registry,
    functionName: "owner"
  });

  const isVaultOk = tvl !== undefined;
  const isMarketOk = nextSlotId !== undefined;
  const isRegistryOk = registryOwner !== undefined;
  const isDaoOk = proposalCount !== undefined;
  const isSystemHealthy = isVaultOk && isMarketOk && isRegistryOk && isDaoOk;
  const totalModulesOnline = [isVaultOk, isMarketOk, isRegistryOk, isDaoOk].filter(Boolean).length;
  const heroProofs = [
    "Unified climate/energy web3 showcase",
    "On-chain dashboard with real protocol events",
    "Wallet-ready flows across 4 connected modules"
  ];

  useEffect(() => {
    async function fetchImpact() {
      if (!publicClient) return;
      setIsLoadingImpact(true);
      setImpactError(null);

      try {
        const latestBlock = await publicClient.getBlockNumber();
        const rangeMeta = RANGE_OPTIONS.find((item) => item.key === range)!;
        const fromBlock =
          rangeMeta.key === "all" || latestBlock <= rangeMeta.blocks
            ? BigInt(0)
            : latestBlock - rangeMeta.blocks;

        const [deposits, matched, retired, votes, carbonMints] = await Promise.all([
          getLogsChunked(publicClient, {
            address: addresses.vault,
            event: parseAbiItem(
              "event Deposited(address indexed user, uint256 usdcAmount, uint256 shares)"
            ) as AbiEvent,
            fromBlock,
            toBlock: latestBlock
          }),
          getLogsChunked(publicClient, {
            address: addresses.market,
            event: parseAbiItem(
              "event SlotMatched(uint256 indexed slotId, address indexed producer, address indexed consumer, uint256 paidWei, uint256 oracleFactorBps)"
            ) as AbiEvent,
            fromBlock,
            toBlock: latestBlock
          }),
          getLogsChunked(publicClient, {
            address: addresses.registry,
            event: parseAbiItem(
              "event Retired(address indexed from, uint256 indexed id, uint256 amount, string reason)"
            ) as AbiEvent,
            fromBlock,
            toBlock: latestBlock
          }),
          getLogsChunked(publicClient, {
            address: addresses.dao,
            event: parseAbiItem(
              "event Voted(uint256 indexed id, address indexed voter, bool support)"
            ) as AbiEvent,
            fromBlock,
            toBlock: latestBlock
          }),
          hasCarbonCredits
            ? getLogsChunked(publicClient, {
                address: addresses.carbonCredits,
                event: parseAbiItem(
                  "event CarbonCreditsMinted(address indexed to, uint256 amount)"
                ) as AbiEvent,
                fromBlock,
                toBlock: latestBlock
              })
            : Promise.resolve([])
        ]);

        const depositedUsdc = deposits.reduce(
          (acc, log) => acc + (log.args.usdcAmount ?? BigInt(0)),
          BigInt(0)
        );
        const matchedEth = matched.reduce(
          (acc, log) => acc + (log.args.paidWei ?? BigInt(0)),
          BigInt(0)
        );
        const retiredRecs = retired.reduce(
          (acc, log) => acc + (log.args.amount ?? BigInt(0)),
          BigInt(0)
        );
        const carbonCreditsMinted = carbonMints.reduce(
          (acc, log) => acc + (log.args.amount ?? BigInt(0)),
          BigInt(0)
        );

        setImpact({
          depositedUsdc,
          matchedEth,
          retiredRecs,
          carbonCreditsMinted,
          votes: votes.length
        });

        const activityDeposits: ActivityItem[] = deposits.map((log) => ({
          id: `${log.transactionHash}-dep`,
          label: "Vault deposit",
          value: `${Number(formatUnits(log.args.usdcAmount ?? BigInt(0), 6)).toLocaleString()} USDC`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber
        }));

        const activityMatched: ActivityItem[] = matched.map((log) => ({
          id: `${log.transactionHash}-mat`,
          label: "Market match",
          value: `${Number(formatEther(log.args.paidWei ?? BigInt(0))).toLocaleString()} ETH`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber
        }));

        const activityRetired: ActivityItem[] = retired.map((log) => ({
          id: `${log.transactionHash}-ret`,
          label: "REC retired",
          value: `${(log.args.amount ?? BigInt(0)).toString()} REC`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber
        }));

        const activityVotes: ActivityItem[] = votes.map((log) => ({
          id: `${log.transactionHash}-vot`,
          label: "DAO vote",
          value: log.args.support ? "YES" : "NO",
          txHash: log.transactionHash,
          blockNumber: log.blockNumber
        }));

        const activityCarbon: ActivityItem[] = carbonMints.map((log) => ({
          id: `${log.transactionHash}-co2`,
          label: "Carbon credits minted",
          value: `${(log.args.amount ?? BigInt(0)).toString()} units`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber
        }));

        const recentActivity = [
          ...activityDeposits,
          ...activityMatched,
          ...activityRetired,
          ...activityVotes,
          ...activityCarbon
        ]
          .sort((a, b) => Number((b.blockNumber ?? BigInt(0)) - (a.blockNumber ?? BigInt(0))))
          .slice(0, 12);

        setActivity(recentActivity);
        setLastUpdatedAt(new Date().toLocaleTimeString());
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown dashboard error";
        setImpactError(message);
      } finally {
        setIsLoadingImpact(false);
      }
    }

    void fetchImpact();
  }, [publicClient, range, refreshNonce]);

  return (
    <main className="page">
      <section className="hero hero-shell">
        <div className="hero-copy">
          <span className="eyebrow">Recruiter-ready climate/energy web3 flagship</span>
          <h1>GreenChain Common</h1>
          <p>
            A unified dApp connecting vault, market, registry, and governance into one coherent
            product flow with live on-chain KPI tracking.
          </p>
          <div className="hero-actions">
            <Link href="/vault" className="button-link button-link-primary">
              Start demo flow
            </Link>
            <a href="#modules" className="button-link button-link-secondary">
              Explore modules
            </a>
            <a
              href="https://github.com/ChristopheChollet"
              target="_blank"
              rel="noreferrer"
              className="button-link button-link-secondary"
            >
              View GitHub
            </a>
          </div>
          <div className="hero-proof-list">
            {heroProofs.map((proof) => (
              <span key={proof} className="proof-pill">
                {proof}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-side-card">
          <p className="hero-side-label">Demo at a glance</p>
          <div className="hero-side-stats">
            <div>
              <span className="hero-stat-value">{totalModulesOnline}/4</span>
              <span className="hero-stat-label">Modules online</span>
            </div>
            <div>
              <span className="hero-stat-value">{impact.votes}</span>
              <span className="hero-stat-label">Votes indexed</span>
            </div>
            <div>
              <span className="hero-stat-value">
                {Number(formatUnits((tvl as bigint | undefined) ?? BigInt(0), 6)).toLocaleString()}
              </span>
              <span className="hero-stat-label">TVL USDC</span>
            </div>
          </div>
          <p className="note">
            Network target: <strong>{deployedNetwork}</strong>
          </p>
        </div>
      </section>

      <section className="flow-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Unified product flow</p>
            <h2>From capital deposit to ecosystem governance</h2>
          </div>
          <p className="section-copy">
            The flagship is designed to show how separate MVPs can become one demonstrable product
            story.
          </p>
        </div>
        <div className="flow-grid">
          {modules.map((module) => (
            <Link key={module.href} href={module.href} className="flow-card">
              <span className="flow-step">Step {module.step}</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <span className="flow-outcome">{module.outcome}</span>
            </Link>
          ))}
        </div>
      </section>

      <NetworkBanner connectedChainId={connectedChainId} expectedChainId={deployedChainId} />

      <section className="panel proof-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Why this project matters</p>
            <h2>What GreenChain Common demonstrates</h2>
          </div>
        </div>
        <div className="proof-grid">
          <article className="proof-card">
            <h3>Full-stack web3 integration</h3>
            <p>Multiple smart contracts exposed through one wallet-connected frontend.</p>
          </article>
          <article className="proof-card">
            <h3>Transactional UX</h3>
            <p>Readable actions, network awareness, contract reads, and transaction feedback.</p>
          </article>
          <article className="proof-card">
            <h3>On-chain KPI dashboard</h3>
            <p>Protocol events are aggregated into activity feeds and portfolio-friendly metrics.</p>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Live dashboard</p>
            <h2>Controls and refresh state</h2>
          </div>
        </div>
        <div className="controls-row">
          <label>
            Time range
            <select value={range} onChange={(e) => setRange(e.target.value as RangeKey)}>
              {RANGE_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => setRefreshNonce((v) => v + 1)} disabled={isLoadingImpact}>
            {isLoadingImpact ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <p className="note">Last updated: {lastUpdatedAt}</p>
        {impactError && <p className="note error-note">Dashboard error: {impactError}</p>}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Protocol status</p>
            <h2>Health check</h2>
          </div>
          <span className={isSystemHealthy ? "status-badge status-ok" : "status-badge status-error"}>
            {isSystemHealthy ? "Healthy" : "Degraded"}
          </span>
        </div>
        <div className="health-grid">
          <HealthRow label="System" isOk={isSystemHealthy} />
          <HealthRow label="Vault contract" isOk={isVaultOk} />
          <HealthRow label="Market contract" isOk={isMarketOk} />
          <HealthRow label="Registry contract" isOk={isRegistryOk} />
          <HealthRow label="DAO contract" isOk={isDaoOk} />
        </div>
        <button type="button" onClick={() => setRefreshNonce((v) => v + 1)}>
          Recheck health
        </button>
      </section>

      <section className="kpi-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Impact snapshot</p>
            <h2>Core KPI</h2>
          </div>
        </div>
      </section>

      <section className="grid">
        <article className="card metric-card">
          <h2>TVL (vault)</h2>
          <p>{Number(formatUnits((tvl as bigint | undefined) ?? BigInt(0), 6)).toLocaleString()} USDC</p>
        </article>
        <article className="card metric-card">
          <h2>Slots created</h2>
          <p>{String(nextSlotId ?? BigInt(0))}</p>
        </article>
        <article className="card metric-card">
          <h2>Proposals</h2>
          <p>{String(proposalCount ?? BigInt(0))}</p>
        </article>
        <article className="card metric-card">
          <h2>Votes cast</h2>
          <p>{impact.votes}</p>
        </article>
        <article className="card metric-card">
          <h2>USDC deposited (events)</h2>
          <p>{Number(formatUnits(impact.depositedUsdc, 6)).toLocaleString()} USDC</p>
        </article>
        <article className="card metric-card">
          <h2>Market matched volume</h2>
          <p>{Number(formatEther(impact.matchedEth)).toLocaleString()} ETH</p>
        </article>
        <article className="card metric-card">
          <h2>RECs retired</h2>
          <p>{impact.retiredRecs.toString()}</p>
        </article>
        {hasCarbonCredits && (
          <article className="card metric-card">
            <h2>Carbon credits minted (events)</h2>
            <p>{impact.carbonCreditsMinted.toString()}</p>
            <p className="note">Demo ERC-1155 units minted in lockstep with REC issuance (same amount).</p>
          </article>
        )}
      </section>

      <section className="panel">
        <h2>Recent activity</h2>
        {activity.length === 0 ? (
          <p className="note">No recent on-chain activity for the selected range.</p>
        ) : (
          <ul className="activity-list">
            {activity.map((item) => (
              <li key={item.id}>
                <span>{item.label}</span>
                <span>{item.value}</span>
                <span>{item.txHash ? `${item.txHash.slice(0, 8)}...${item.txHash.slice(-6)}` : "-"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="modules" className="modules-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Interactive modules</p>
            <h2>Explore the flagship building blocks</h2>
          </div>
          <p className="section-copy">
            Each module remains navigable on its own while contributing to the combined demo story.
          </p>
        </div>
      </section>
      <section className="grid">
        {modules.map((module) => (
          <Link key={module.href} href={module.href} className="card">
            <h2>{module.title}</h2>
            <p>{module.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
