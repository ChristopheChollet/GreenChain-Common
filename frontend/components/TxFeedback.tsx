"use client";

type TxFeedbackProps = {
  hash?: `0x${string}`;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error?: Error | null;
  lastAction: string;
  chainId: number;
};

function explorerBaseUrl(chainId: number): string | null {
  if (chainId === 11155111) return "https://sepolia.etherscan.io/tx/";
  return null;
}

export function TxFeedback({
  hash,
  isPending,
  isConfirming,
  isSuccess,
  error,
  lastAction,
  chainId
}: TxFeedbackProps) {
  const status = isPending ? "waiting wallet..." : isConfirming ? "confirming..." : "idle";
  const txExplorer = hash ? explorerBaseUrl(chainId) : null;

  return (
    <section className="panel">
      <h2>Transaction state</h2>
      <p className="note">
        Status: {status} | Last action: {lastAction}
      </p>
      {hash && (
        <p className="note">
          Tx hash: {hash}
          {txExplorer ? (
            <>
              {" "}
              -{" "}
              <a href={`${txExplorer}${hash}`} target="_blank" rel="noreferrer">
                open in explorer
              </a>
            </>
          ) : (
            " (local network: no explorer)"
          )}
        </p>
      )}
      {isSuccess && <p className="note ok-note">Transaction confirmed.</p>}
      {error && <p className="note error-note">Error: {error.message}</p>}
    </section>
  );
}
