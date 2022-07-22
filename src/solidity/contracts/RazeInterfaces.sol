// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;

interface IFissionEngine    { 
    function flipRate() external view returns(uint tokensPerUnit); 
}


interface IRazeMoney        { 
    event CampaignOpened(uint campaignId, address router, uint recipientId, address currentRecipient, uint goal);
    event CampaignClosed(uint campaignId, address recipient, uint penniesUSD);
    struct Campaign {
        address router;     // ERC721(router)
        uint recipientId;   // address recipient = ERC721(router).ownerOf(recipientId)
        uint goal;          // USD
        uint state;         // gas
        bool open;          // (un)claimed
    }
    function accruedAmount(uint campaignId) external view returns(uint pennies);
    function registerCampaign(uint recipientId, uint goal) external;
    function endCampaign(uint campaignId) external;

    event ContributionMade(uint campaignId, uint tokenId, uint usd, uint gas);
    struct Receipt {
        uint campaignId;    // @Campaign
        uint usd;           // penny value of contribution (at the time)
        uint gas;           // wei value of contribution (at the time)
    }
    function collectionOf       (address contributor)                   external view   returns(uint[] memory collection);
    function isSupporter        (uint campaignId, address contributor)  external view   returns(uint tokenId); // 0 is falsey
    function receiptMetadata    (uint tokenId)                          external view   returns(uint campaignId, uint pennyValue, uint gasValue);
    // IRazeFunder Exclusive
    function updateReceipt      (uint tokenId, uint usd, uint gas)      external;
    function mintReceipt        (uint campaignId, address contributor, uint usd, uint gas)   external    returns(uint tokenId); 
    // Admin Only
    function defineRouter(address _router) external;
    function defineMinter(address _minter) external;
    function defineOracle(address _minter) external;
    // function campaignCloseout() external;
    // burn function?
}


interface IRazeFunder       {
    function contribute(uint campaignId) external payable;
    // IRazeMoney Exclusive 
    function toPennies(uint amount) external view returns(uint pennies);
    // Admin Only
    function defineMinter(address _minter) external;
    function defineRecords(address _records) external;
    function defineOracle(address _minter) external;
    function defineTeamWallet(address _wallet) external;
}


interface IRazeRouter       { 
    event BeneficiaryRegistered(address beneficiary, uint id);
    event Liquidation(address recipient, uint amount, uint campaignId);
    // IRazeFunder Exclusive
    function deposit(uint campaignId) external payable; 
    // IRazeMoney Exclusive
    function liquidateCampaign(uint campaignId, address recipient) external;
    // Admin Only
    function defineMinter(address _minter) external;
    function defineRecords(address _records) external;
}