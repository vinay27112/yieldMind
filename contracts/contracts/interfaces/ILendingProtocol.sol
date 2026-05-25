// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;  

interface ILendingProtocol {
    function deposit(address token, uint256 amount) external;
    function withdraw(address token, uint256 amount) external;
  }