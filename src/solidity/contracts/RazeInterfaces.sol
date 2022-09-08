// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;


interface IRazeMoney        { 
    event CampaignOpened(uint campaignId, address router, uint recipientId, address currentRecipient, uint goal);
    event CampaignClosed(uint campaignId, address recipient, uint penniesUSD);
    event ContributionMade(uint campaignId, uint tokenId, uint usd, uint gas);

    // Admin Only
    function defineRouter(address _router) external;
    function defineMinter(address _minter) external;
    function setBase(string memory uri) external;
    
    struct Campaign {
        address router;     // ERC721(router)
        uint recipientId;   // address recipient = ERC721(router).ownerOf(recipientId)
        uint goal;          // USD
        uint state;         // gas
        bool open;          // (un)claimed
    }

    // Public
    function accruedAmount(uint campaignId) external view returns(uint pennies);
    function registerCampaign(uint recipientId, uint goal) external;
    function endCampaign(uint campaignId) external;

    struct Receipt {
        uint campaignId;    // @Campaign
        uint usd;           // penny value of contribution (at the time)
        uint gas;           // wei value of contribution (at the time)
    }

    // Public
    function collectionOf       (address contributor)                   external view   returns(uint[] memory collection);
    function isSupporter        (uint campaignId, address contributor)  external view   returns(uint tokenId); // 0 is falsey
    function receiptMetadata    (uint tokenId)                          external view   returns(uint campaignId, uint pennyValue, uint gasValue);
    
    // IRazeFunder Exclusive
    function updateReceipt      (uint tokenId, uint usd, uint gas)      external;
    function mintReceipt        (uint campaignId, address contributor, uint usd, uint gas)   external    returns(uint tokenId); 

    // Admin Only
    // function campaignCloseout() external;
}


interface IRazeFunder       {
    // Admin Only
    function defineTeamWallet(address _wallet) external;
    function defineRouter(address _router) external;
    function defineRecords(address _records) external;
    function defineOracle(address _minter) external;

    // IRazeMoney Exclusive 
    function toPennies(uint amount) external view returns(uint pennies);

    // Public
    function contribute(uint campaignId) external payable;
}


interface IRazeRouter       { 
    event BeneficiaryRegistered(address beneficiary, uint id);
    event Liquidation(address recipient, uint amount, uint campaignId);

    // Admin Only
    function defineMinter(address _minter) external;
    function defineRecords(address _records) external;
    function setBase(string memory uri) external;
    function toggleVerification(uint id) external;
    function registerBeneficiary(address beneficiary) external;

    // IRazeFunder Exclusive
    function deposit(uint campaignId) external payable; 

    // IRazeMoney Exclusive
    function liquidateCampaign(uint campaignId, address recipient) external;
}