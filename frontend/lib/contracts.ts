import type { Abi } from "viem";
import { hardhat, sepolia } from "wagmi/chains";
import addressesLocal from "@/config/addresses.local.json";
import greenVaultAbiJson from "@/config/abis/GreenVaultSimple.json";
import mockUsdcAbiJson from "@/config/abis/MockUSDC.json";
import gridFlexMarketAbiJson from "@/config/abis/GridFlexMarket.json";
import greenRecsRegistryAbiJson from "@/config/abis/GreenRecsRegistry.json";
import carbonCreditsAbiJson from "@/config/abis/CarbonCredits1155.json";
import energyGovernanceDaoAbiJson from "@/config/abis/EnergyGovernanceDAO.json";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

const contracts = addressesLocal.contracts as typeof addressesLocal.contracts & {
  carbonCredits?: string;
};

export const deployedNetwork = addressesLocal.networkName;
export const deployedChainId = addressesLocal.chainId;
export const deployedChain = deployedChainId === sepolia.id ? sepolia : hardhat;

const carbonCreditsRaw = contracts.carbonCredits ?? ZERO_ADDRESS;
export const hasCarbonCredits =
  Boolean(carbonCreditsRaw) && carbonCreditsRaw.toLowerCase() !== ZERO_ADDRESS;

export const addresses = {
  mockUsdc: contracts.mockUsdc as `0x${string}`,
  vault: contracts.vault as `0x${string}`,
  market: contracts.market as `0x${string}`,
  registry: contracts.registry as `0x${string}`,
  dao: contracts.dao as `0x${string}`,
  carbonCredits: carbonCreditsRaw as `0x${string}`
};

/** ERC-1155 token id for demo carbon credits (must match contract). */
export const CARBON_CREDIT_TOKEN_ID = 1n;

export const abis = {
  mockUsdc: mockUsdcAbiJson as Abi,
  vault: greenVaultAbiJson as Abi,
  market: gridFlexMarketAbiJson as Abi,
  registry: greenRecsRegistryAbiJson as Abi,
  dao: energyGovernanceDaoAbiJson as Abi,
  carbonCredits: carbonCreditsAbiJson as Abi
};
