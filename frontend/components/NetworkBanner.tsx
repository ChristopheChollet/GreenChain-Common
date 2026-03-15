"use client";

type NetworkBannerProps = {
  connectedChainId?: number;
  expectedChainId: number;
};

export function NetworkBanner({ connectedChainId, expectedChainId }: NetworkBannerProps) {
  if (!connectedChainId) {
    return <p className="note">Wallet not connected.</p>;
  }

  if (connectedChainId === expectedChainId) {
    return <p className="note ok-note">Network OK (chainId {connectedChainId}).</p>;
  }

  return (
    <p className="note error-note">
      Wrong network. Connected chainId {connectedChainId}, expected {expectedChainId}.
    </p>
  );
}
