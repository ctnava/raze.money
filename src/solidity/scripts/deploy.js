const { runDeployment, saveFrontendFiles } = require("./deployment");
const hre = require("hardhat");
const ethers = hre.ethers;

const oracles = require("./utils/oracles");
async function deployAll() {
  const provider = new ethers.providers.JsonRpcProvider(hre.network.config.url);
  const { chainId } = await provider.getNetwork();
  const deployer = (await ethers.getSigners())[0];
  console.log(
    `\nDeploying contracts with ${deployer.address} on chain:${chainId}`
  );
  console.log(`Account balance: ${(await deployer.getBalance()).toString()}\n`);

  // deploy wallet
  const TeamWallet = await runDeployment("TeamWallet", chainId);

  // deploy simulator if necessary
  let PolygonLinkSim;
  const isDev = chainId === 31337 || chainId === 1337;
  if (isDev) PolygonLinkSim = await runDeployment("PolygonLinkSim", chainId);
  const plsSet = PolygonLinkSim !== undefined;
  const oracle =
    plsSet === true ? PolygonLinkSim.address : oracles[chainId.toString()];

  // deploy & configure core contracts
  const RazeFunder = await runDeployment("RazeFunder", chainId);
  const RazeRouter = await runDeployment("RazeRouter", chainId);
  const RazeMoney = await runDeployment("RazeMoney", chainId);

  // initialize Payments
  await RazeFunder.defineTeamWallet(TeamWallet.address);
  await RazeFunder.defineRouter(RazeRouter.address);
  await RazeFunder.defineRecords(RazeMoney.address);
  await RazeFunder.defineOracle(oracle);

  // initialize Router
  await RazeRouter.defineMinter(RazeFunder.address);
  await RazeRouter.defineRecords(RazeMoney.address);

  // initialize Records
  await RazeMoney.defineRouter(RazeRouter.address);
  await RazeMoney.defineMinter(RazeFunder.address);
}

deployAll();
