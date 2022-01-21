const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Delegation", function() {
  let Delegate, delegate, Delegation, delegation;
  let owner1, owner2, alice, bob, signers;

  beforeEach(async function() {
    [owner1, owner2, alice, bob, signers] = await ethers.getSigners();
    Delegate = await ethers.getContractFactory("Delegate");
    delegate = await Delegate.deploy(owner1.address);
    Delegation = await ethers.getContractFactory("Delegation");
    delegation = await Delegation.connect(owner2).deploy(delegate.address);
  });

  describe("deployment", async function() {
    it("should set the owners", async function() {
      expect(await delegate.owner()).to.equal(owner1.address);
      expect(await delegation.owner()).to.equal(owner2.address);
    });
  });
});
