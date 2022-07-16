const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString()); // eslint-disable-line no-undef
const fromWei = (num) => ethers.utils.formatEther(num); // eslint-disable-line no-undef

const txHist = (signer) => {
	let etherscanProvider = new ethers.providers.EtherscanProvider(); // eslint-disable-line no-undef
	return etherscanProvider.getHistory(signer.address);
};

module.exports = 
{ 
	toWei, fromWei,
	txHist 
};