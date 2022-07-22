// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RazeInterfaces.sol";

// Payment Processor & Coordination Contract
contract RazeFunder is Ownable, IRazeFunder {
	string public constant name = 'Raze Funder by L3gendary DAO';
	string public constant description = 'NFT Minter & Metrics Recorder';

	address public teamWallet;	// TeamWallet.sol
	function defineTeamWallet(address _wallet) public override onlyOwner { teamWallet = _wallet; }
	address public router;		// RazeRouter.sol
	function defineRouter(address _router) public override onlyOwner { router = _router; }
	address public records;		// RazeMoney.sol
	function defineRecords(address _records) public override onlyOwner { records = _records; }
	address public oracle;		// AggregatorV3Interface.sol
	function defineOracle(address _oracle) public override onlyOwner { oracle = _oracle; }

	constructor() {}

	// plan to reduce this to 0.1% as the project grows
	uint teamCut = 10; // 1% === 10/1000

	function toPennies(uint amount) public view override returns(uint pennies) {
        require(msg.sender == records, "Not Authorized");
		AggregatorV3Interface pricefeed = AggregatorV3Interface(oracle);
        (,int priceInt,,,) = pricefeed.latestRoundData();
        uint price = uint(priceInt);
        uint raw = amount * price;
        pennies = raw / (10**16);
    }
	
	function contribute(uint campaignId) public payable override {
		uint penniesUsd = toPennies(msg.value) / (10**8);
		
		// minimum contribution $10
		require(penniesUsd >= 1000, "Contribution <$10");

		IRazeMoney record = IRazeMoney(records);
		uint receiptId = record.isSupporter(campaignId, msg.sender);
		if (receiptId == 0) {
			record.mintReceipt(campaignId, msg.sender, penniesUsd, msg.value);
		} else {
			record.updateReceipt(receiptId, penniesUsd, msg.value);
		}

		uint cut = (msg.value* teamCut) / 1000;
		bool sent = payable(teamWallet).send(cut);
        require(sent, "Failed to send Ether");

		uint remainder = msg.value - cut;
		IRazeRouter(router).deposit{value:remainder}(campaignId);
	}
}
