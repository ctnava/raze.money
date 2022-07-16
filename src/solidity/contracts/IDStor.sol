// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;


interface IDStor {
	event FileUpdated(address recipient);
	struct File {
		string fileHash;
		uint fileSize;
		string fileType;
		string fileName;
		string fileDescription;
		address recipient;
		uint uploadTime;
		address uploader;
	}
	function basicInfo() external view returns(string memory n, address fe, uint mp, uint pr, uint mfs, uint fc);
	function getAddresses(string memory query) external view returns(address from, address to);
	function quote(uint numBytes) external view returns(uint perDiem, uint benchFee);
	function gasQuote(uint numBytes) external view returns(uint weiPerDiem, uint weiBenchFee);
	function bothQuotes(uint numBytes) external view returns(uint perDiem, uint benchFee, uint weiPerDiem, uint weiBenchFee);
	function addTime(uint fileId) external payable;
	function upload(string memory _fileHash, uint _fileSize, string memory _fileType, string memory _fileName, string memory _fileDescription, address recipient) external payable;
	function modify(uint fileId, string memory fileName, string memory description, address recipient) external;
	function get(uint fileId) external view returns(File memory);
	function getAccessibleFileIds(bool isSender) external view returns(uint[] memory);
	function getAccessibleFiles(bool isSender) external view returns(File[] memory);
	function getAccessibleExps(bool isSender) external view returns(uint[] memory);
	function getAllData() external view returns(File[] memory sent, uint[] memory sentExps, uint[] memory sentIds, File[] memory received, uint[] memory receivedExps, uint[] memory receivedIds);
	function batchExpQuery(string[] memory query) external view returns(bool[] memory isExpired, uint[] memory tilExpiry);
	function setMinFileSize(uint value) external;
	function setPinningRate(uint value) external;
	function setFission(address fission) external;
	function takeProfit() external;
}