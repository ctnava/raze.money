// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Payment Dissemination Contract
contract RazeRouter is Ownable, ERC721 {
    string public constant description = 'Campaign Liquidity Router';

	address public records;

    constructor(address _records) ERC721("Raze Router by L3gendary DAO", "R&R") {
        records = _records;
    }
}