import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { network } from "hardhat";

type DeploymentAddresses = {
  chainId: number;
  networkName: string;
  deployedAt: string;
  contracts: {
    mockUsdc: string;
    vault: string;
    oracle: string;
    market: string;
    registry: string;
    dao: string;
  };
};

async function main() {
  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const networkName =
    process.env.HARDHAT_NETWORK ?? (Number(chainId) === 31337 ? "hardhat" : `chain-${chainId}`);

  console.log("Deployer:", deployer.address);
  console.log("Network:", networkName, `(chainId=${chainId})`);

  // 1) Mock USDC for local testing
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUsdc = await MockUSDC.deploy();
  await mockUsdc.waitForDeployment();

  // Mint test liquidity to deployer (100,000 USDC with 6 decimals)
  await mockUsdc.mint(deployer.address, 100_000n * 10n ** 6n);

  // 2) Vault
  const Vault = await ethers.getContractFactory("GreenVaultSimple");
  const vault = await Vault.deploy(await mockUsdc.getAddress());
  await vault.waitForDeployment();

  // 3) Grid oracle + market
  const Oracle = await ethers.getContractFactory("MockGridOracle");
  const oracle = await Oracle.deploy(10_000); // 1.0x default factor
  await oracle.waitForDeployment();

  const Market = await ethers.getContractFactory("GridFlexMarket");
  const market = await Market.deploy(await oracle.getAddress());
  await market.waitForDeployment();

  // 4) RECs registry
  const Registry = await ethers.getContractFactory("GreenRecsRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  // 5) Governance DAO
  const DAO = await ethers.getContractFactory("EnergyGovernanceDAO");
  const dao = await DAO.deploy();
  await dao.waitForDeployment();

  const addresses: DeploymentAddresses = {
    chainId: Number(chainId),
    networkName,
    deployedAt: new Date().toISOString(),
    contracts: {
      mockUsdc: await mockUsdc.getAddress(),
      vault: await vault.getAddress(),
      oracle: await oracle.getAddress(),
      market: await market.getAddress(),
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
  const frontendOutPath = join(frontendOutDir, "addresses.local.json");
  writeFileSync(frontendOutPath, JSON.stringify(addresses, null, 2), "utf-8");

  // Export ABIs for frontend integration
  const frontendAbiDir = join(frontendOutDir, "abis");
  mkdirSync(frontendAbiDir, { recursive: true });
  writeFileSync(
    join(frontendAbiDir, "MockUSDC.json"),
    MockUSDC.interface.formatJson(),
    "utf-8"
  );
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
    join(frontendAbiDir, "GreenRecsRegistry.json"),
    Registry.interface.formatJson(),
    "utf-8"
  );
  writeFileSync(
    join(frontendAbiDir, "EnergyGovernanceDAO.json"),
    DAO.interface.formatJson(),
    "utf-8"
  );

  console.log("✅ MockUSDC:", addresses.contracts.mockUsdc);
  console.log("✅ GreenVaultSimple:", addresses.contracts.vault);
  console.log("✅ MockGridOracle:", addresses.contracts.oracle);
  console.log("✅ GridFlexMarket:", addresses.contracts.market);
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
