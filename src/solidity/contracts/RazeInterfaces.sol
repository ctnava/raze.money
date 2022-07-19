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
        uint state;         // USD
        bool open;          // (un)claimed
    }
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
}


interface IRazeFunder       { 
    function flipRate() external view returns(uint tokensPerUnit); 
}


interface IRazeRouter       { 
    function flipRate() external view returns(uint tokensPerUnit); 
}