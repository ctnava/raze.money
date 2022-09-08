/* eslint-disable jest/valid-expect */
const { assert, expect } = require("chai");

const { constructorArgs } = require("../scripts/utils/constructorArgs");
const { balance } = require("../utils/onchain.js");

describe("Ecosystem", () => {
  let deployer, members, otherMembers, outsiders, otherClients;
  let PolygonLinkSim, TeamWallet, RazeRouter, RazeFunder, RazeMoney;
  let tx;

  beforeEach(async () => {
    // Get Signers
    [deployer, ...otherClients] = await ethers.getSigners();
    otherMembers = otherClients.slice(0, 4);
    members = [deployer, ...otherMembers];
    outsiders = otherClients.slice(4, otherClients.length);

    // Get Factories
    const PolygonLinkSimFactory = await ethers.getContractFactory(
      "PolygonLinkSim"
    );
    const TeamWalletFactory = await ethers.getContractFactory("TeamWallet");
    const RazeRouterFactory = await ethers.getContractFactory("RazeRouter");
    const RazeFunderFactory = await ethers.getContractFactory("RazeFunder");
    const RazeMoneyFactory = await ethers.getContractFactory("RazeMoney");

    // Deploy Contracts
    PolygonLinkSim = await PolygonLinkSimFactory.connect(deployer).deploy(
      ...constructorArgs["PolygonLinkSim"]
    );
    TeamWallet = await TeamWalletFactory.connect(deployer).deploy(
      ...constructorArgs["TeamWallet"]
    );
    RazeRouter = await RazeRouterFactory.connect(deployer).deploy(
      ...constructorArgs["RazeRouter"]
    );
    RazeFunder = await RazeFunderFactory.connect(deployer).deploy(
      ...constructorArgs["RazeFunder"]
    );
    RazeMoney = await RazeMoneyFactory.connect(deployer).deploy(
      ...constructorArgs["RazeMoney"]
    );

    // Setup - TeamWallet
    let id = 1;
    for await (const account of otherMembers) {
      id++;
      await TeamWallet.connect(deployer).transferFrom(
        deployer.address,
        account.address,
        id
      );
    }

    // initialize Payments
    await RazeFunder.defineTeamWallet(TeamWallet.address);
    await RazeFunder.defineRouter(RazeRouter.address);
    await RazeFunder.defineRecords(RazeMoney.address);
    await RazeFunder.defineOracle(PolygonLinkSim.address);

    // initialize Router
    await RazeRouter.defineMinter(RazeFunder.address);
    await RazeRouter.defineRecords(RazeMoney.address);

    // initialize Records
    await RazeMoney.defineRouter(RazeRouter.address);
    await RazeMoney.defineMinter(RazeFunder.address);
  });

  describe("Deployment", () => {
    it("Should put out some constants", async () => {
      // Payments
      expect(await RazeFunder.teamWallet()).to.equal(TeamWallet.address);
      expect(await RazeFunder.router()).to.equal(RazeRouter.address);
      expect(await RazeFunder.records()).to.equal(RazeMoney.address);
      expect(await RazeFunder.oracle()).to.equal(PolygonLinkSim.address);

      // Router
      expect(await RazeRouter.minter()).to.equal(RazeFunder.address);
      expect(await RazeRouter.records()).to.equal(RazeMoney.address);
      expect(await RazeRouter.baseURI()).to.equal(
        constructorArgs["RazeRouter"][0]
      );

      // Records
      expect(await RazeMoney.router()).to.equal(RazeRouter.address);
      expect(await RazeMoney.minter()).to.equal(RazeFunder.address);
      expect(await RazeMoney.baseURI()).to.equal(
        constructorArgs["RazeMoney"][0]
      );
    });
  });

  describe("Registering a Fund", () => {
    it("Should register beneficiaries via NFT", async () => {
      expect(await RazeRouter.numBeneficiaries()).to.equal(0);
      await RazeRouter.connect(deployer).registerBeneficiary(
        outsiders[0].address
      );
      expect(await RazeRouter.numBeneficiaries()).to.equal(1);
      expect(await RazeRouter.ownerOf(1)).to.equal(outsiders[0].address);

      // revert "Already Minted"

      await RazeRouter.connect(deployer).registerBeneficiary(
        outsiders[1].address
      );
      expect(await RazeRouter.numBeneficiaries()).to.equal(2);
      expect(await RazeRouter.ownerOf(2)).to.equal(outsiders[1].address);

      expect(await RazeRouter.verified(1)).to.equal(false);
      expect(await RazeRouter.verified(2)).to.equal(false);

      // revert "only owner"

      await RazeRouter.connect(deployer).toggleVerification(1);

      expect(await RazeRouter.verified(1)).to.equal(true);
      expect(await RazeRouter.verified(2)).to.equal(false);

      await RazeRouter.connect(deployer).toggleVerification(2);

      expect(await RazeRouter.verified(1)).to.equal(true);
      expect(await RazeRouter.verified(2)).to.equal(true);

      await RazeRouter.connect(deployer).toggleVerification(1);

      expect(await RazeRouter.verified(1)).to.equal(false);
      expect(await RazeRouter.verified(2)).to.equal(true);
    });

    it("Should allow beneficiaries to start a campaign", async () => {
      expect(await RazeRouter.numBeneficiaries()).to.equal(0);

      await RazeRouter.connect(deployer).registerBeneficiary(
        outsiders[0].address
      );

      expect(await RazeMoney.numCampaigns()).to.equal(0);

      // revert "Invalid Recipient"

      await RazeMoney.connect(outsiders[0]).registerCampaign(1, 10000); // $100 USD
      expect(await RazeMoney.numCampaigns()).to.equal(1);
      let campaign = await RazeMoney.campaigns(1);
      expect(campaign.router).to.equal(RazeRouter.address);
      expect(campaign.recipientId).to.equal(1);
      expect(campaign.goal).to.equal(10000);
      expect(campaign.state).to.equal(0);
      expect(campaign.open).to.equal(true);
      expect(await RazeMoney.accruedAmount(1)).to.equal(0);
    });
  });

  async function registerBeneficiaries() {
    await RazeRouter.connect(deployer).registerBeneficiary(
      outsiders[0].address
    );
    await RazeRouter.connect(deployer).registerBeneficiary(
      outsiders[1].address
    );
    await RazeRouter.connect(deployer).toggleVerification(1);
    await RazeMoney.connect(outsiders[0]).registerCampaign(1, 10000);
    await RazeMoney.connect(outsiders[1]).registerCampaign(2, 20000);
  }

  async function contributions() {
    await RazeFunder.connect(outsiders[2]).contribute(1, {
      value: ethers.utils.parseEther("20.0"),
    });
    await RazeFunder.connect(outsiders[2]).contribute(2, {
      value: ethers.utils.parseEther("40.0"),
    });
    await RazeFunder.connect(outsiders[2]).contribute(1, {
      value: ethers.utils.parseEther("40.0"),
    });
  }

  describe("Contributing", async () => {
    it("Allows anyone to contribute, multiple times", async () => {
      await registerBeneficiaries();
      expect(await RazeMoney.numCampaigns()).to.equal(2);
      let receipt, collection, token, campaign, amount;

      // prevent direct contribution to RazeMoney contract
      // prevent contribution to nonexistent campaigns
      // enforce minimum USD Value (due to float limitation)
      token = await RazeMoney.isSupporter(1, outsiders[2].address);
      expect(token).to.equal(ethers.BigNumber.from(0));
      token = await RazeMoney.isSupporter(2, outsiders[2].address);
      expect(token).to.equal(ethers.BigNumber.from(0));

      // Donate 20 MATIC to fund 1
      await (
        await RazeFunder.connect(outsiders[2]).contribute(1, {
          value: ethers.utils.parseEther("20.0"),
        })
      ).wait(1);
      expect(await RazeMoney.numTokens()).to.equal(1);
      expect(await RazeMoney.balanceOf(outsiders[2].address)).to.equal(1);
      expect(await RazeMoney.ownerOf(1)).to.equal(outsiders[2].address);
      collection = await RazeMoney.collectionOf(outsiders[2].address);
      assert.deepEqual(collection, [ethers.BigNumber.from(1)]);
      token = await RazeMoney.isSupporter(1, outsiders[2].address);
      // console.log("token 1", token);
      expect(token).to.equal(ethers.BigNumber.from(1));
      receipt = await RazeMoney.receipts(1);
      // console.log("receipt 1", receipt);
      expect(receipt.campaignId).to.equal(1);
      expect(receipt.gas).to.equal(ethers.utils.parseEther("20.0"));
      expect(receipt.usd).to.equal(89 * 20);
      campaign = await RazeMoney.campaigns(1);
      expect(campaign.state).to.equal(ethers.utils.parseEther("20.0"));
      amount = await RazeMoney.accruedAmount(1);
      expect(amount).to.equal(89 * 20);

      // Donate 40 MATIC to fund 2
      await (
        await RazeFunder.connect(outsiders[2]).contribute(2, {
          value: ethers.utils.parseEther("40.0"),
        })
      ).wait(1);
      expect(await RazeMoney.numTokens()).to.equal(2);
      expect(await RazeMoney.balanceOf(outsiders[2].address)).to.equal(2);
      expect(await RazeMoney.ownerOf(2)).to.equal(outsiders[2].address);
      collection = await RazeMoney.collectionOf(outsiders[2].address);
      assert.deepEqual(collection, [
        ethers.BigNumber.from(1),
        ethers.BigNumber.from(2),
      ]);
      token = await RazeMoney.isSupporter(2, outsiders[2].address);
      // console.log("token 2", token);
      expect(token).to.equal(ethers.BigNumber.from(2));
      receipt = await RazeMoney.receipts(2);
      // console.log("receipt 2", receipt);
      expect(receipt.campaignId).to.equal(2);
      expect(receipt.gas).to.equal(ethers.utils.parseEther("40.0"));
      expect(receipt.usd).to.equal(89 * 40);
      campaign = await RazeMoney.campaigns(2);
      expect(campaign.state).to.equal(ethers.utils.parseEther("40.0"));
      amount = await RazeMoney.accruedAmount(2);
      expect(amount).to.equal(89 * 40);

      // Donate 20 MATIC to fund 1
      await (
        await RazeFunder.connect(outsiders[2]).contribute(1, {
          value: ethers.utils.parseEther("20.0"),
        })
      ).wait(1);
      expect(await RazeMoney.numTokens()).to.equal(2);
      expect(await RazeMoney.balanceOf(outsiders[2].address)).to.equal(2);
      expect(await RazeMoney.ownerOf(1)).to.equal(outsiders[2].address);
      collection = await RazeMoney.collectionOf(outsiders[2].address);
      assert.deepEqual(collection, [
        ethers.BigNumber.from(1),
        ethers.BigNumber.from(2),
      ]);
      token = await RazeMoney.isSupporter(1, outsiders[2].address);
      // console.log(token);
      expect(token).to.equal(ethers.BigNumber.from(1));
      receipt = await RazeMoney.receipts(1);
      // console.log(receipt);
      expect(receipt.campaignId).to.equal(1);
      expect(receipt.gas).to.equal(ethers.utils.parseEther("40.0"));
      expect(receipt.usd).to.equal(89 * 40);
      campaign = await RazeMoney.campaigns(1);
      expect(campaign.state).to.equal(ethers.utils.parseEther("40.0"));
      expect(amount).to.equal(89 * 40);
      amount = await RazeMoney.accruedAmount(1);
      expect(amount).to.equal(89 * 40);
    });

    it("Routes liquidity to the team and beneficiary", async () => {
      await registerBeneficiaries();
      await contributions();
      expect(await balance(RazeMoney)).to.equal(0);
      expect(await balance(RazeFunder)).to.equal(0);
      let rbal = parseInt((await balance(RazeRouter)).toString());
      let tbal = parseInt((await balance(TeamWallet)).toString());
      let total = rbal + tbal;
      let cut = parseInt((await RazeFunder.teamCut()).toString());
      let expected = total * (cut / 1000);
      expect(tbal).to.equal(expected);
      expect(rbal).to.equal(total - expected);
    });
  });

  describe("Collecting", () => {
    it("Allows the beneficiary to close campaigns at will", async () => {
      await registerBeneficiaries();
      await contributions();
      await RazeMoney.connect(outsiders[1]).endCampaign(2);
    });

    it("Allows the beneficiary to withdraw to their wallet", async () => {
      await registerBeneficiaries();
      await contributions();
      let raised = await RazeRouter.campaignBalance(1);
      await expect(() =>
        RazeMoney.connect(outsiders[0]).endCampaign(1)
      ).to.changeEtherBalances([outsiders[0]], [raised]);
    });
  });
});
