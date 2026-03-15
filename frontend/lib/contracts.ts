import type { Abi } from "viem";
import { hardhat, sepolia } from "wagmi/chains";
import addressesLocal from "@/config/addresses.local.json";
import greenVaultAbiJson from "@/config/abis/GreenVaultSimple.json";
import mockUsdcAbiJson from "@/config/abis/MockUSDC.json";
import gridFlexMarketAbiJson from "@/config/abis/GridFlexMarket.json";
import greenRecsRegistryAbiJson from "@/config/abis/GreenRecsRegistry.json";
import energyGovernanceDaoAbiJson from "@/config/abis/EnergyGovernanceDAO.json";

export const deployedNetwork = addressesLocal.networkName;
export const deployedChainId = addressesLocal.chainId;
export const deployedChain = deployedChainId === sepolia.id ? sepolia : hardhat;

export const addresses = {
  mockUsdc: addressesLocal.contracts.mockUsdc as `0x${string}`,
  vault: addressesLocal.contracts.vault as `0x${string}`,
  market: addressesLocal.contracts.market as `0x${string}`,
  registry: addressesLocal.contracts.registry as `0x${string}`,
  dao: addressesLocal.contracts.dao as `0x${string}`
};

export const abis = {
  mockUsdc: mockUsdcAbiJson as Abi,
  vault: greenVaultAbiJson as Abi,
  market: gridFlexMarketAbiJson as Abi,
  registry: greenRecsRegistryAbiJson as Abi,
  dao: energyGovernanceDaoAbiJson as Abi
};
