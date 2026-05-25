const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy MockERC20
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockERC20.deploy("Mock USDC", "mUSDC");
  await mockUSDC.waitForDeployment();
  console.log("MockUSDC deployed to:", await mockUSDC.getAddress());

  // Deploy two MockProtocol instances
  const MockProtocol = await hre.ethers.getContractFactory("MockProtocol");

  const mockAave = await MockProtocol.deploy();
  await mockAave.waitForDeployment();
  console.log("MockAave deployed to:", await mockAave.getAddress());

  const mockCompound = await MockProtocol.deploy();
  await mockCompound.waitForDeployment();
  console.log("MockCompound deployed to:", await mockCompound.getAddress());

  // Deploy RiskOracle
  const RiskOracle = await hre.ethers.getContractFactory("RiskOracle");
  const riskOracle = await RiskOracle.deploy();
  await riskOracle.waitForDeployment();
  console.log("RiskOracle deployed to:", await riskOracle.getAddress());

  // Deploy AlertRegistry
  const AlertRegistry = await hre.ethers.getContractFactory("AlertRegistry");
  const alertRegistry = await AlertRegistry.deploy();
  await alertRegistry.waitForDeployment();
  console.log("AlertRegistry deployed to:", await alertRegistry.getAddress());

  // Deploy YieldVault
  const YieldVault = await hre.ethers.getContractFactory("YieldVault");
  const yieldVault = await YieldVault.deploy();
  await yieldVault.waitForDeployment();
  console.log("YieldVault deployed to:", await yieldVault.getAddress());

  // Wire everything together
  await yieldVault.addToken(await mockUSDC.getAddress());
  console.log("MockUSDC added as supported token");

  await yieldVault.addProtocol(await mockAave.getAddress());
  console.log("MockAave added as approved protocol");

  await yieldVault.addProtocol(await mockCompound.getAddress());
  console.log("MockCompound added as approved protocol");

  console.log("\n--- Deployment Summary ---");
  console.log("MockUSDC:      ", await mockUSDC.getAddress());
  console.log("MockAave:      ", await mockAave.getAddress());
  console.log("MockCompound:  ", await mockCompound.getAddress());
  console.log("RiskOracle:    ", await riskOracle.getAddress());
  console.log("AlertRegistry: ", await alertRegistry.getAddress());
  console.log("YieldVault:    ", await yieldVault.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
