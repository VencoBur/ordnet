const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Seeding contract with account:", deployer.address);

  // Correct path - payload is at project root, not inside contracts/
  const payloadPath = path.join(__dirname, "../../test-data/real-indexer-payload.json");
  const shards = JSON.parse(fs.readFileSync(payloadPath, "utf8"));

  console.log(`Loaded ${shards.length} shards from payload`);

  const contractAddress = process.env.CONTRACT_ADDRESS || "0xb630553212ffF7bFb4d1f536B940F302Cd0C7cB0";

  const OrdinalReassemblerV2 = await hre.ethers.getContractFactory("OrdinalReassemblerV2");
  const contract = OrdinalReassemblerV2.attach(contractAddress);

  console.log("Calling batchAddShards() on contract:", contractAddress);

  const tx = await contract.batchAddShards(shards);
  console.log("Transaction sent:", tx.hash);

  const receipt = await tx.wait();
  console.log("Transaction confirmed. Gas used:", receipt.gasUsed.toString());

  const count = await contract.getShardCount();
  console.log(`\n✅ Successfully seeded ${count} shards on LitVM Testnet`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});