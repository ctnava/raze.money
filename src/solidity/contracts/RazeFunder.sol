// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RazeInterfaces.sol";
import "./RazeMoney.sol";

// Payment Processor & Coordination Contract
contract RazeFunder is Ownable {
	string public constant name = 'Raze Funder by L3gendary DAO';
	string public constant description = 'NFT Minter & Metrics Recorder';

	address public teamWallet;
	function setTeamWallet(address _wallet)	public onlyOwner { teamWallet = _wallet; }

	address public router;
	function setRouter(address _router) 	public onlyOwner { router = _router; }

	address public records;
	function setRecords(address _records) 	public onlyOwner { records = _records; }

	address public oracle;
	function setOracle(address _oracle) 	public onlyOwner { oracle = _oracle; }

	constructor(address _wallet, address _router, address _records, address _oracle) { 
		setTeamWallet(_wallet); 
		setRouter(_router);
		setRecords(_records);
		setOracle(_oracle);
	}

	uint teamCut = 5; // 0.5% === 5/1000
	
	function contribute(uint campaignId) external payable {
		// add tip amount & route to wallet
		uint penniesUsd = 0; // calculate me
		IRazeMoney record = IRazeMoney(records);
		uint receiptId = record.isSupporter(campaignId, msg.sender);
		if (receiptId == 0) {
			record.mintReceipt(campaignId, msg.sender, penniesUsd, msg.value);
		} else {
			record.updateReceipt(receiptId, penniesUsd, msg.value);
		}
		// send to router
	}
}
