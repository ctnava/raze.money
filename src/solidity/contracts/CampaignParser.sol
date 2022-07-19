// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;
import "./RazeInterfaces.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CampaignParser is Ownable {

    address public records;
    function defineRecords(address _records) public onlyOwner { records = _records; }

    constructor(address _records) { defineRecords(_records); }

    // search queries
}