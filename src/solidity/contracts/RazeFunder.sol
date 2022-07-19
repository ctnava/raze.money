// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RazeInterfaces.sol";
import "./RazeMoney.sol";

contract RazeFunder is Ownable {
	constructor( ) { }
	string public constant name = 'Raze Funder by L3gendary DAO';
	string public constant description = 'NFT Minter & Metrics Recorder';
	
	address public fissionEngine;
	function setFission(address fission) public onlyOwner { fissionEngine = fission; }
	function toWei(uint amount) private view returns(uint weiAmount) {
		IFissionEngine FissionEngine = IFissionEngine(fissionEngine);
		uint flipped = FissionEngine.flipRate();
		weiAmount = (amount * flipped) / (10**8);
	}
	
	address public razeMoney;
	function contribute(uint campaign, uint id) external payable {
		bool hasCampaignNft;

		// if(!hasCampaignNft){mint(campaign);}, mint and then...
		uint usdValue = 0; // calculate me
		RazeMoney(razeMoney).update(id, usdValue, msg.value);
	}


	function takeProfit() public {
		payable(owner()).transfer(address(this).balance);
	}
}
