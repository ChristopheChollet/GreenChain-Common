import "dotenv/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";

function sanitizePrivateKey(pk?: string): string | undefined {
  if (!pk) return undefined;
  const s = pk.trim();
  if (s.length === 0) return undefined;
  return s.startsWith("0x") ? s : `0x${s}`;
}

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28"
      }
    }
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1"
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url:
        process.env.SEPOLIA_RPC_URL ||
        process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
        "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: sanitizePrivateKey(process.env.SEPOLIA_PRIVATE_KEY)
        ? [sanitizePrivateKey(process.env.SEPOLIA_PRIVATE_KEY)!]
        : []
    }
  }
});
