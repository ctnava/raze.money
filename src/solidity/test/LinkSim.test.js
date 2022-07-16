/* eslint-disable jest/valid-expect */
const { ethers } = require("hardhat");
const { expect } = require("chai");
const { constructorArgs } = require("../scripts/utils/constructorArgs");

describe("PolygonLinkSim", () => {
    let PolygonLinkSim;
    let deployer, otherClients; // eslint-disable-line no-unused-vars
    
    beforeEach(async () => {
        // Get ContractFactory and Signers
		const LinkSimFactory = await ethers.getContractFactory("PolygonLinkSim");
		[deployer, ...otherClients] = await ethers.getSigners();

		PolygonLinkSim = await LinkSimFactory.connect(deployer).deploy(...constructorArgs["PolygonLinkSim"]); // Deploy
    });

    describe("Deployment", () => {
        it("Should put out some constants", async () => {
            expect(await PolygonLinkSim.description()).to.equal("MATIC / USD");
            expect(await PolygonLinkSim.decimals()).to.equal(8);
            expect(await PolygonLinkSim.version()).to.equal(42069);
            const price = 2 * (10 ** 8);
            const latestRoundData = await PolygonLinkSim.latestRoundData();
            expect(latestRoundData[1].toNumber()).to.equal(price);
            const getRoundData = await PolygonLinkSim.getRoundData(1);
            expect(getRoundData[1].toNumber()).to.equal(price);
        });
    });
});