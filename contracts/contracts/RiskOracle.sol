// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;  

import "@openzeppelin/contracts/access/AccessControl.sol";

contract RiskOracle is AccessControl{
  bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

  struct RiskData {
    uint8 score;
    uint256 updatedAt;
    bytes32 dataHash;
  }

  mapping(address => RiskData) public riskScores;

  event RiskScoreUpdated(address indexed user, uint8 score, bytes32 dataHash, uint256 timestamp);

  constructor() {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(ORACLE_ROLE, msg.sender);
  }

  function updateRiskScore(address user, uint8 score, bytes32 dataHash) external onlyRole(ORACLE_ROLE) {
    require(score <= 100, "Score must be between 0 and 100");
    riskScores[user] = RiskData(score, block.timestamp, dataHash);
    emit RiskScoreUpdated(user, score, dataHash, block.timestamp);
  }

  function getRiskScore(address user) external view returns (uint8 score, uint256 updatedAt, bytes32 dataHash) {
    RiskData memory data = riskScores[user];
    return (data.score, data.updatedAt, data.dataHash);
  } 
}