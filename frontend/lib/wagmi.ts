import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-project-id";

export const wagmiConfig = getDefaultConfig({
  appName: "GreenChain Common",
  projectId: walletConnectProjectId,
  chains: [hardhat, sepolia],
  transports: {
    [hardhat.id]: http(process.env.NEXT_PUBLIC_HARDHAT_RPC_URL ?? "http://127.0.0.1:8545"),
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com"
    )
  }
});
