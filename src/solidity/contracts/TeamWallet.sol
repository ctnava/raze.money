// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Simple, Sloppy, Profit & Receivables Contract
// replacable/ not permanent
// deployer gets all of the NFTs to distribute

contract TeamWallet is ERC721 {
    string public constant description = 'Team NFT Multi-Sig Wallet';
    uint numTokens = 5;
    
    constructor(string memory nameOf, string memory symbolOf) ERC721(nameOf, symbolOf) {
        _mint(msg.sender, 1);
        _mint(msg.sender, 2);
        _mint(msg.sender, 3);
        _mint(msg.sender, 4);
        _mint(msg.sender, 5);
    }

    struct Proposal {
        address destination;
        uint amount;
        bool[] votes;
        bool executed;
    }
    mapping(uint => Proposal) public proposals;
    uint numProposals;

    function votes(uint proposalId) public view returns(bool[] memory result) { return proposals[proposalId].votes; }

    modifier MembersOnly() { require(balanceOf(msg.sender) != 0, "Members Only");_; }

    function propose(address destination, uint amount) public MembersOnly {
        numProposals++;
        proposals[numProposals] = Proposal(destination, amount, new bool[](5), false);
    }

    function voteToggle(uint proposalId, uint memberId) public MembersOnly {
        require(ownerOf(memberId) == msg.sender, "Invalid Member ID");
        proposals[proposalId].votes[memberId - 1] = !proposals[proposalId].votes[memberId - 1];
    }

    function execute(uint proposalId) public {
        Proposal memory proposal = proposals[proposalId];
        address payable destination = payable(proposal.destination);

        uint inFavor = 0;
        for (uint i = 0; i < 5; i++) {
            if (proposal.votes[i]) { inFavor++; } 
        }

        require(!proposal.executed, "Expired Proposal");
        require(inFavor >= 3, "Not Passed");
        
        bool sent = destination.send(proposal.amount);
        require(sent, "Failed to send Ether");
    }

    receive() external payable {}
}