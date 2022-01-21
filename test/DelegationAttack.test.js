const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DelegationAttack", function() {
  let Delegate, delegate, Delegation, delegation, DelegationAttack, delegationAttack;
  let owner1, owner2, attacker, alice, bob, signers;

  beforeEach(async function() {
    [owner1, owner2, attacker, alice, bob, signers] = await ethers.getSigners();
    Delegate = await ethers.getContractFactory("Delegate");
    delegate = await Delegate.deploy(owner1.address);
    Delegation = await ethers.getContractFactory("Delegation");
    delegation = await Delegation.connect(owner2).deploy(delegate.address);
    DelegationAttack = await ethers.getContractFactory("DelegationAttack");
    delegationAttack = await DelegationAttack.connect(attacker).deploy();
  });

  describe("deployment", function() {
    it("should set the attacker", async function() {
      expect(await delegationAttack.attacker()).to.equal(attacker.address);
    });
  });

  describe("#attack", function() {
    it("should be reverted if non-attacker tries", async function() {
      await expect(
        delegationAttack.connect(alice).attack(delegation.address)
      ).to.be.revertedWith(
        "DelegationAttack: NOT_OWNER"
      );
    });

    it("should change the owner of the Delegate contract", async function() {
      await delegationAttack.connect(attacker).attack(delegation.address);
      expect(await delegate.owner()).to.equal(owner1.address);
      expect(await delegation.owner()).to.equal(delegationAttack.address);
    })
  });
});
