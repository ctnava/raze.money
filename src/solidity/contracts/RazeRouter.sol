// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./RazeInterfaces.sol";

// Payment Dissemination Contract
contract RazeRouter is Ownable, ERC721, IRazeRouter {
    string public constant description = 'Campaign Liquidity Router';

    address public minter;
	function defineMinter(address _minter) 	public onlyOwner { minter = _minter; }

    address public records;
	function defineRecords(address _records) 	public onlyOwner { records = _records; }
    
    mapping(uint => uint) public campaignBalance;

    constructor(address _records) ERC721("Raze Router by L3gendary DAO", "R&R") {
        records = _records;
    }

    // need mint functions

    function deposit(uint campaignId) public payable {
        require(msg.sender == minter, "Minter Only");
        campaignBalance[campaignId] += msg.value;
    }

    function liquidateCampaign(uint campaignId, address recipient) public {
        require(msg.sender == records, "Records Only");

        uint amount = campaignBalance[campaignId];
        payable(recipient).transfer(amount);
        campaignBalance[campaignId] = 0;

        emit Liquidation(recipient, amount, campaignId);
    }
}