// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./RazeInterfaces.sol";

// Payment Dissemination Contract
contract RazeRouter is Ownable, ERC721, IRazeRouter {

    string public constant description = 'Campaign Liquidity Router';

    address public minter;      // RazeFunder.sol
	function defineMinter(address _minter) public override onlyOwner { minter = _minter; }
    address public records;     // RazeMoney.sol
	function defineRecords(address _records) public override onlyOwner { records = _records; }
    
    string public baseURI;      // Hardhat REST x IPFS
    function _baseURI() internal override view returns(string memory) { return baseURI; }
    function setBase(string memory uri) public override onlyOwner { baseURI = uri; }

    constructor(string memory uri) ERC721("Raze Router by L3gendary DAO", "R&R") {
        setBase(uri);
    }
    
    function toggleVerification(uint id) public override onlyOwner { verified[id] = !verified[id]; }
    mapping(uint => uint) public campaignBalance;
    mapping(uint => bool) public verified;
    uint public numBeneficiaries;

    // need mint functions
    function registerBeneficiary(address beneficiary) public override onlyOwner {
        // prevents duplicate registration
        require(balanceOf(beneficiary) == 0, "Already Minted");

        numBeneficiaries++;
        _mint(beneficiary, numBeneficiaries);

        emit BeneficiaryRegistered(beneficiary, numBeneficiaries);
    }

    function deposit(uint campaignId) public payable override {
        require(msg.sender == minter, "Minter Only");
        // valid campaign
        
        campaignBalance[campaignId] += msg.value;
    }

    function liquidateCampaign(uint campaignId, address recipient) public override {
        require(msg.sender == records, "Records Only");
        // valid campaign 

        uint amount = campaignBalance[campaignId];
        payable(recipient).transfer(amount);
        campaignBalance[campaignId] = 0;

        emit Liquidation(recipient, amount, campaignId);
    }
}