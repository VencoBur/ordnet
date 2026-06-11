const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const OrdinalReassemblerV2 = await hre.ethers.getContractFactory("OrdinalReassemblerV2");
  const contract = await OrdinalReassemblerV2.deploy();

  // Ethers v5 syntax
  await contract.deployed();

  console.log("OrdinalReassemblerV2 deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});