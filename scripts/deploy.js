const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account: ", deployer.address
  );

  console.log("Account balance: ", (await deployer.getBalance()).toString());

  const Delegate = await ethers.getContractFactory("Delegate");
  const delegate = await Delegate.deploy(deployer.address);
  console.log("Delegate address: ", await delegate.address);
  console.log("Account balance after Delegate deploy: ", (await deployer.getBalance()).toString());

  const Delegation = await ethers.getContractFactory("Delegation");
  const delegation = await Delegation.deploy(delegate.address);
  console.log("Delegation address: ", await delegation.address);
  console.log("Account balance after Delegation deploy: ", (await deployer.getBalance()).toString());

  const DelegationAttack = await ethers.getContractFactory("DelegationAttack");
  const delegationAttack = await DelegationAttack.deploy();
  console.log("DelegationAttack address: ", await delegationAttack.address);
  console.log("Account Balance after DelegationAttack deploy: ", (await deployer.getBalance()).toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
