// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Payment Router
contract RazeRouter is Ownable, ERC721 {
    constructor() ERC721("Raze Router by L3gendary DAO", "R&R") {}
    string public constant description = 'Campaign Liquidity Router';
}