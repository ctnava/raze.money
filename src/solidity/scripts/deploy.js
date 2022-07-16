const { runDeployment, saveFrontendFiles } = require("./deployment");
const hre = require("hardhat");
const ethers = hre.ethers;

const oracles = require("./utils/oracles");
async function deployAll() {
    const provider = new ethers.providers.JsonRpcProvider(hre.network.config.url);
    const {chainId} = await provider.getNetwork();
    const deployer = (await ethers.getSigners())[0];
    console.log(`\nDeploying contracts with ${deployer.address} on chain:${chainId}`);
    console.log(`Account balance: ${(await deployer.getBalance()).toString()}\n`);
    
    let PLS;
    const isDev = (chainId === 31337 || chainId === 1337);
    if (isDev) PLS = await runDeployment("PolygonLinkSim", chainId);
    const plsSet = (PLS !== undefined);
    const oracle = (plsSet === true) ? PLS.address : oracles[chainId.toString()];

    const DStor = await runDeployment("DStor", chainId);
    const FissionEngineFactory = await ethers.getContractFactory("FissionEngine");
    console.log("oracle", oracle);
    const FissionEngine = await FissionEngineFactory.deploy(oracle, DStor.address);
    console.log(`\nFissionEngine deployed to ${FissionEngine.address}`);
    console.log(`Account balance: ${(await deployer.getBalance()).toString()}`);
    saveFrontendFiles(FissionEngine, "FissionEngine", chainId);

    await DStor.setFission(FissionEngine.address);
    console.log("Fission Engine Linked to DStor");
    console.log(`Account balance: ${(await deployer.getBalance()).toString()}\n`);
}

deployAll()