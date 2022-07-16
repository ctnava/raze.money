/* eslint-disable jest/valid-expect */
const { ethers } = require("hardhat");
const { expect } = require("chai");
const { constructorArgs } = require("../scripts/utils/constructorArgs");


describe("FissionEngine", () => {
    let FissionEngine;
    let PolygonLinkSim;
    let deployer, otherClients; // eslint-disable-line no-unused-vars
    
    beforeEach(async () => {
        // Get ContractFactory and Signers
		const FissionEngineFactory = await ethers.getContractFactory("FissionEngine");
        const LinkSimFactory = await ethers.getContractFactory("PolygonLinkSim");
		[deployer, ...otherClients] = await ethers.getSigners();
        PolygonLinkSim = await LinkSimFactory.connect(deployer).deploy(...constructorArgs["PolygonLinkSim"]); // Deploy
		FissionEngine = await FissionEngineFactory.connect(deployer).deploy(PolygonLinkSim.address, deployer.address); // Deploy
    });

    describe("Deployment", () => {
        it("Should return nothing useful to those not authorized", async () => {
            await expect(FissionEngine.connect(otherClients[0]).flipRate()).to.be.reverted;
        });

        it("Should allow those authorized to get results", async () => {
            const result = await FissionEngine.connect(deployer).flipRate(); // integer overflow
            expect(result.toString()).to.be.equal("500000000000000000"); // 50 cents
        });
    });
});