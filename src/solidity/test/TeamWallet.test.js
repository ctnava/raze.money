/* eslint-disable jest/valid-expect */
const { ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { constructorArgs } = require("../scripts/utils/constructorArgs");

describe("TeamWallet", () => {
  let TeamWallet;
  let deployer, otherClients;

  beforeEach(async () => {
    // Get ContractFactory and Signers
    const TeamWalletFactory = await ethers.getContractFactory("TeamWallet");
    [deployer, ...otherClients] = await ethers.getSigners();
    TeamWallet = await TeamWalletFactory.connect(deployer).deploy(
      ...constructorArgs["TeamWallet"]
    );
  });

  describe("Deployment", () => {
    it("should give the deployer 5 NFTs", async () => {
      let result = await TeamWallet.connect(deployer).balanceOf(
        deployer.address
      );
      expect(result.toString()).to.equal("5");
    });
  });
});
