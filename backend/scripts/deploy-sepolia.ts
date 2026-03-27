import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { network } from "hardhat";

type DeploymentAddresses = {
  chainId: number;
  networkName: string;
  deployedAt: string;
  contracts: {
    usdc: string;
    vault: string;
    oracle: string;
    market: string;
    carbonCredits: string;
    registry: string;
    dao: string;
  };
};

function requireAddress(value: string | undefined, key: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value.trim();
}

async function main() {
  const networkName = process.env.HARDHAT_NETWORK ?? "sepolia";
  if (networkName !== "sepolia") {
    throw new Error("This script is only meant for --network sepolia.");
  }

  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;

  const usdcAddress = requireAddress(process.env.SEPOLIA_USDC_ADDRESS, "SEPOLIA_USDC_ADDRESS");

  console.log("Deployer:", deployer.address);
  console.log("Network:", networkName, `(chainId=${chainId})`);
  console.log("USDC:", usdcAddress);

  // 1) Vault (wired to existing Sepolia USDC)
  const Vault = await ethers.getContractFactory("GreenVaultSimple");
  const vault = await Vault.deploy(usdcAddress);
  await vault.waitForDeployment();

  // 2) Grid oracle + market
  const Oracle = await ethers.getContractFactory("MockGridOracle");
  const oracle = await Oracle.deploy(10_000);
  await oracle.waitForDeployment();

  const Market = await ethers.getContractFactory("GridFlexMarket");
  const market = await Market.deploy(await oracle.getAddress());
  await market.waitForDeployment();

  // 3) Carbon credits + RECs registry
  const Carbon = await ethers.getContractFactory("CarbonCredits1155");
  const carbon = await Carbon.deploy(deployer.address);
  await carbon.waitForDeployment();

  const Registry = await ethers.getContractFactory("GreenRecsRegistry");
  const registry = await Registry.deploy(await carbon.getAddress());
  await registry.waitForDeployment();

  await (await carbon.setRegistry(await registry.getAddress())).wait();

  // 4) Governance DAO
  const DAO = await ethers.getContractFactory("EnergyGovernanceDAO");
  const dao = await DAO.deploy();
  await dao.waitForDeployment();

  const addresses: DeploymentAddresses = {
    chainId: Number(chainId),
    networkName,
    deployedAt: new Date().toISOString(),
    contracts: {
      usdc: usdcAddress,
      vault: await vault.getAddress(),
      oracle: await oracle.getAddress(),
      market: await market.getAddress(),
      carbonCredits: await carbon.getAddress(),
      registry: await registry.getAddress(),
      dao: await dao.getAddress()
    }
  };

  // Write backend deployment artifact
  const backendOutDir = join(process.cwd(), "deployments");
  mkdirSync(backendOutDir, { recursive: true });
  const backendOutPath = join(backendOutDir, `${networkName}.json`);
  writeFileSync(backendOutPath, JSON.stringify(addresses, null, 2), "utf-8");

  // Mirror addresses for frontend consumption
  const frontendOutDir = join(process.cwd(), "..", "frontend", "config");
  mkdirSync(frontendOutDir, { recursive: true });
  const frontendOutPath = join(frontendOutDir, `addresses.${networkName}.json`);
  writeFileSync(frontendOutPath, JSON.stringify(addresses, null, 2), "utf-8");

  // Export ABIs for frontend integration
  const frontendAbiDir = join(frontendOutDir, "abis");
  mkdirSync(frontendAbiDir, { recursive: true });
  writeFileSync(
    join(frontendAbiDir, "GreenVaultSimple.json"),
    Vault.interface.formatJson(),
    "utf-8"
  );
  writeFileSync(
    join(frontendAbiDir, "MockGridOracle.json"),
    Oracle.interface.formatJson(),
    "utf-8"
  );
  writeFileSync(
    join(frontendAbiDir, "GridFlexMarket.json"),
    Market.interface.formatJson(),
    "utf-8"
  );
  writeFileSync(
    join(frontendAbiDir, "CarbonCredits1155.json"),
    Carbon.interface.formatJson(),
    "utf-8"
  );
  writeFileSync(
    join(frontendAbiDir, "GreenRecsRegistry.json"),
    Registry.interface.formatJson(),
    "utf-8"
  );
  writeFileSync(
    join(frontendAbiDir, "EnergyGovernanceDAO.json"),
    DAO.interface.formatJson(),
    "utf-8"
  );

  console.log("✅ GreenVaultSimple:", addresses.contracts.vault);
  console.log("✅ MockGridOracle:", addresses.contracts.oracle);
  console.log("✅ GridFlexMarket:", addresses.contracts.market);
  console.log("✅ CarbonCredits1155:", addresses.contracts.carbonCredits);
  console.log("✅ GreenRecsRegistry:", addresses.contracts.registry);
  console.log("✅ EnergyGovernanceDAO:", addresses.contracts.dao);
  console.log("📦 Backend addresses:", backendOutPath);
  console.log("📦 Frontend addresses:", frontendOutPath);
  console.log("📦 Frontend ABIs:", frontendAbiDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
