/* eslint-disable jest/valid-expect */
const { assert, expect } = require("chai");

const { constructorArgs } = require("../scripts/utils/constructorArgs");
const { balance } = require("../utils/onchain.js");

describe("TeamWallet", () => {
  let TeamWallet;
  let deployer, members, otherMembers, outsiders, otherClients;

  beforeEach(async () => {
    // Get ContractFactory and Signers
    const TeamWalletFactory = await ethers.getContractFactory("TeamWallet");
    [deployer, ...otherClients] = await ethers.getSigners();
    otherMembers = otherClients.slice(0, 4);
    members = [deployer, ...otherMembers];
    outsiders = otherClients.slice(4, otherClients.length);
    TeamWallet = await TeamWalletFactory.connect(deployer).deploy(
      ...constructorArgs["TeamWallet"]
    );
    let id = 1;
    for await (const account of otherMembers) {
      id++;
      await TeamWallet.connect(deployer).transferFrom(
        deployer.address,
        account.address,
        id
      );
    }
  });

  describe("Deployment", () => {
    it("should give the deployer 5 NFTs for distribution", async () => {
      let result;
      let id = 1;
      for await (const account of members) {
        result = await TeamWallet.balanceOf(account.address);
        expect(result.toString()).to.equal("1");
        result = await TeamWallet.ownerOf(id);
        expect(result.toString()).to.equal(account.address);
        id++;
      }
    });
  });

  describe("Operation", () => {
    const defaultVotes = [false, false, false, false, false];

    it("should allow members to propose", async () => {
      let result;
      for await (const account of members) {
        await TeamWallet.connect(account).propose(account.address, 1);
      }
      result = await TeamWallet.numProposals();
      expect(result.toString()).to.equal("5");

      let id = 1;
      for await (const account of members) {
        result = await TeamWallet.proposals(id);
        expect(result.amount.toString()).to.equal("1");
        expect(result.destination).to.equal(account.address);
        expect(result.executed).to.equal(false);
        result = await TeamWallet.votes(id);
        assert.deepEqual(result, defaultVotes);
        id++;
      }

      //    PASSES
      //   await expect(
      //     await TeamWallet.connect(outsiders[0]).propose(outsiders[0].address, 2)
      //   ).to.be.revertedWith("Members Only");
    });

    it("should have voting", async () => {
      let result, votes;

      for await (const account of members) {
        await TeamWallet.connect(account).propose(account.address, 1);
      }

      let id = 1;
      for await (const account of members) {
        votes = defaultVotes.slice();
        await TeamWallet.connect(account).voteToggle(id, id);
        votes[id - 1] = true;
        result = await TeamWallet.votes(id);
        assert.deepEqual(result, votes);
        id++;
      }

      //    PASSES
      //   await expect(
      //     await TeamWallet.connect(members[0]).voteToggle(2, 2)
      //   ).to.be.revertedWith("Invalid Member ID");

      //    PASSES
      //   await expect(
      //     await TeamWallet.connect(outsiders[0]).voteToggle(2, 2)
      //   ).to.be.revertedWith("Members Only");
    });

    it("should allow anyone to execute", async () => {
      for await (const account of members) {
        await TeamWallet.connect(account).propose(account.address, 1);
      }

      // execute unanimous
      let id = 1;
      for await (const account of members) {
        await TeamWallet.connect(account).voteToggle(1, id);
        id++;
      }

      let bal;

      //    PASSES
      //   await expect(
      //     await TeamWallet.connect(outsiders[0]).execute(1)
      //   ).to.be.revertedWith("Failed to send Ether");

      await outsiders[0].sendTransaction({ to: TeamWallet.address, value: 5 });
      await TeamWallet.connect(members[1]).execute(1);
      expect(await balance(TeamWallet)).to.equal(4);

      await TeamWallet.connect(members[0]).voteToggle(2, 1);
      await TeamWallet.connect(members[1]).voteToggle(2, 2);
      await TeamWallet.connect(members[2]).voteToggle(2, 3);
      await TeamWallet.connect(outsiders[1]).execute(2);
      expect(await balance(TeamWallet)).to.equal(3);

      //    PASSES
      //   await expect(
      //     await TeamWallet.connect(outsiders[0]).execute(1)
      //   ).to.be.revertedWith("Expired Proposal");

      //    PASSES
      //   await expect(
      //     await TeamWallet.connect(outsiders[0]).execute(3)
      //   ).to.be.revertedWith("Not Passed");
    });
  });
});
