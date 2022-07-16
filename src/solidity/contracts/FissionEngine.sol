// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
// Contract by CAT6#2699
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract FissionEngine {
    address public priceFeedAddress;
    address public sister;

    constructor(address _priceFeedAddress, address _sister) { 
        priceFeedAddress = _priceFeedAddress;
        sister = _sister;
    }

    function flipRate() public view returns(uint tokensPerUnit) {
        require(msg.sender == sister);
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
        uint feedExp = 10 ** priceFeed.decimals(); 
        uint tokenExp = 10 ** 18;
        uint feedExpSquared = feedExp ** 2;
        (,int price,,,) = priceFeed.latestRoundData();
        uint feedRawPrice = uint(price);
        uint feedRawPriceSquared = feedRawPrice ** 2;
        uint helper;
        uint divisible;

        if(tokenExp >= feedExp) {
            helper = tokenExp/feedExp;
            uint indivisible = feedRawPrice * helper;    
            divisible  = indivisible * feedExpSquared; 
        }

        else{
            helper = feedExp*tokenExp; 
            divisible = feedRawPrice * helper;
        }

        tokensPerUnit = divisible/feedRawPriceSquared;
        require(tokensPerUnit != 0); //@Non Fungible Stablecoins
    } 
}