// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./RazeInterfaces.sol";

// non-refundable contribution tracker
contract RazeMoney is Ownable, ERC721, IRazeMoney {
    string public constant description = "Contribution Receipt & Campaign Database Contract";

    address public router;  // liquidity router
	function setRouter(address _router) 	public onlyOwner { router = _router; }

    address public minter;  // payment processor
	function setMinter(address _minter) 	public onlyOwner { minter = _minter; }

    constructor() ERC721("Raze.Money by L3gendary DAO", "#RAZE") {}

    modifier RouterOnly() { require(msg.sender == router, "Router Only");_; }
    modifier MinterOnly() { require(msg.sender == router, "Minter Only");_; }

    // contains a record of campaigns to contribute towards
    mapping(uint => Campaign) private campaigns;
    uint public numCampaigns;

    // creates a campaign record
    function registerCampaign(uint recipientId, uint goal) public {
        address recipient = ERC721(router).ownerOf(recipientId);

        // requires ownership of identity token
        require(recipient == msg.sender, "Invalid Recipient");

        numCampaigns++;
        campaigns[numCampaigns] = Campaign(router, recipientId, goal, 0, true);

        emit CampaignOpened(numCampaigns, router, recipientId, recipient, goal);
    }

    function liquidateCampaign(uint campaignId) internal {
        // DECIDE WHERE THE FUNDS ARE HELD (Probably the router)
    }

    // closes a campaign and cashes out the funds
    function endCampaign(uint campaignId) public {
        Campaign memory campaign = campaigns[campaignId];

        // disallow double cashouts
        require(campaign.open, "Closed Campaign");

        liquidateCampaign(campaignId);
        campaigns[campaignId].open = false;

        emit CampaignClosed(campaignId, ERC721(campaign.router).ownerOf(campaign.recipientId), campaign.state);
    }

    modifier validCampaign(uint campaignId)     {   
        // disallows interaction with non-existent campaigns
        require(campaignId != 0 && campaignId <= numCampaigns, "Invalid Campaign");                          
        _; 
    }

    // ties tokens to Receipt data structure
    mapping(uint => Receipt) private receipts;
    uint public numTokens;

    // returns all NFTs owned by contributor
    function collectionOf(address contributor) public view returns(uint[] memory collection) {
        collection = new uint[](balanceOf(contributor));
        uint index  = 0;
        for(uint i = 1; i <= numTokens; i++) {
            if(ownerOf(i) == contributor) {
                collection[index] = i;
                index++; 
            }  
        } 
    }

    // returns 0 if false, otherwise returns TokenId tied to the campaign
    function isSupporter(uint campaignId, address contributor) public view returns(uint tokenId) {
        uint[] memory collection = collectionOf(contributor);
        for(uint i = 0; i < collection.length; i++) {
            if(receipts[i].campaignId == campaignId) { 
                tokenId = collection[i]; 
            }  
        } 
    }

    // extracts metadata for better digestability 
    function receiptMetadata(uint tokenId) public view returns(uint campaignId, uint pennyValue, uint gasValue) {
        Receipt memory data = receipts[tokenId];
        campaignId  = data.campaignId;
        pennyValue  = data.usd;
        gasValue    = data.gas;
    }

    // MINTER EXCLUSIVE FUNCTIONS
    // updates the receipt's data & campaign's funding state (total contributions)
    function updateReceipt(uint tokenId, uint usd, uint gas) public MinterOnly {
        Receipt storage data = receipts[tokenId];
        uint campaignId = data.campaignId;
        Campaign storage funding = campaigns[campaignId];

        // disallows contributions to non-extant campaigns
        require(funding.open, "Funding Closed"); 

        data.usd += usd;
        data.gas += gas;
        funding.state += usd;

        emit ContributionMade(campaignId, tokenId, usd, gas);
    }

    // mints a new NFT to the contributor's address and then updates the receipt metadata
    function mintReceipt(uint campaignId, address contributor, uint usd, uint gas) 
    public validCampaign(campaignId) MinterOnly returns(uint tokenId) {

        // disallows contributions to non-extant campaigns
        require(campaigns[campaignId].open, "Funding Closed");

        // disallows possession of more than one NFT per campaign
        require(isSupporter(campaignId, contributor) == 0, "Already Minted"); 

        numTokens++;
        tokenId = numTokens;
        _mint(contributor, tokenId);
        receipts[tokenId] = Receipt(campaignId, usd, gas);

        updateReceipt(tokenId, usd, gas);
    }

    // Burn Function?

    // Admin Only
    function defineRouter(address _router) public onlyOwner { router = _router; }
    function defineMinter(address _minter) public onlyOwner { minter = _minter; }
    // function campaignCloseout() public onlyOwner {} // FORCES ALL CAMPAIGNS TO CLOSEOUT & SHUTDOWN THE CONTRACT
}

/* 
throwable:
"Funding Closed"
"Already Minted"
"Invalid Campaign"
"Minter Only"
"Router Only"
"Invalid Recipient"
*/