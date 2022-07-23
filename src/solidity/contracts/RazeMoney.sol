// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./RazeInterfaces.sol";

// non-refundable contribution tracker
contract RazeMoney is Ownable, ERC721, IRazeMoney {

    string public constant description = "Contribution Receipt & Campaign Database Contract";

    address public router;      // RazeRouter.sol
	function defineRouter(address _router) public override onlyOwner { router = _router; }
    address public minter;      // RazeFunder.sol
	function defineMinter(address _minter) public override onlyOwner { minter = _minter; }
    
    string public baseURI;      // Hardhat REST x IPFS
    function _baseURI() internal override view returns(string memory) { return baseURI; }
    function setBase(string memory uri) public override onlyOwner { baseURI = uri; }

    constructor(string memory uri) ERC721("Raze.Money by L3gendary DAO", "#RAZE") {
        setBase(uri);
    }

    modifier RouterOnly() { require(msg.sender == router, "Router Only");_; }
    modifier MinterOnly() { require(msg.sender == minter, "Minter Only");_; }

    // contains a record of campaigns to contribute towards
    mapping(uint => Campaign) public campaigns;
    uint public numCampaigns;

    // displays how many pennies have been accrued (truncated to the nearest whole)
	function accruedAmount(uint campaignId) public view override returns(uint pennies) {
        uint amount = IRazeFunder(minter).toPennies(campaigns[campaignId].goal);
        pennies = amount / (10**8);
    }

    // creates a campaign record
    function registerCampaign(uint recipientId, uint goal) public override {
        address recipient = ERC721(router).ownerOf(recipientId);

        // requires ownership of identity token
        require(recipient == msg.sender, "Invalid Recipient");

        numCampaigns++;
        campaigns[numCampaigns] = Campaign(router, recipientId, goal, 0, true);

        emit CampaignOpened(numCampaigns, router, recipientId, recipient, goal);
    }

    // closes a campaign and cashes out the funds
    function endCampaign(uint campaignId) public override {
        Campaign memory campaign = campaigns[campaignId];
        address recipient = ERC721(campaign.router).ownerOf(campaign.recipientId);

        // disallow double cashouts
        require(campaign.open, "Closed Campaign");
        // disallow trolls
        require(msg.sender == recipient, "Unauthorized");

        IRazeRouter(campaign.router).liquidateCampaign(campaignId, recipient);
        campaigns[campaignId].open = false;

        emit CampaignClosed(campaignId, recipient, campaign.state);
    }

    modifier validCampaign(uint campaignId) {   
        // disallows interaction with non-existent campaigns
        require(campaignId != 0 && campaignId <= numCampaigns, "Invalid Campaign");                          
        _; 
    }

    // ties tokens to Receipt data structure
    mapping(uint => Receipt) public receipts;
    uint public numTokens;

    // returns all NFTs owned by contributor
    function collectionOf(address contributor) public view override returns(uint[] memory collection) {
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
    function isSupporter(uint campaignId, address contributor) public view override returns(uint tokenId) {
        uint[] memory collection = collectionOf(contributor);
        for(uint i = 0; i < collection.length; i++) {
            if(receipts[i].campaignId == campaignId) { 
                tokenId = collection[i]; 
            }  
        } 
    }

    // extracts metadata for better digestability 
    function receiptMetadata(uint tokenId) public view override returns(uint campaignId, uint pennyValue, uint gasValue) {
        Receipt memory data = receipts[tokenId];
        campaignId  = data.campaignId;
        pennyValue  = data.usd;
        gasValue    = data.gas;
    }

    // MINTER EXCLUSIVE FUNCTIONS
    // updates the receipt's data & campaign's funding state (total contributions)
    function updateReceipt(uint tokenId, uint usd, uint gas) public override MinterOnly {
        Receipt storage data = receipts[tokenId];
        uint campaignId = data.campaignId;
        Campaign storage funding = campaigns[campaignId];

        // disallows contributions to non-extant campaigns
        require(funding.open, "Funding Closed"); 

        data.usd += usd;
        data.gas += gas;
        funding.state += gas;

        emit ContributionMade(campaignId, tokenId, usd, gas);
    }

    // mints a new NFT to the contributor's address and then updates the receipt metadata
    function mintReceipt(uint campaignId, address contributor, uint usd, uint gas) 
    public override validCampaign(campaignId) MinterOnly returns(uint tokenId) {

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

    // Admin Only
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