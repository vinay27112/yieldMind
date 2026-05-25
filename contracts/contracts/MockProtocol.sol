// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;  

import "./interfaces/ILendingProtocol.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockProtocol is ILendingProtocol {

  event Deposited(address token, uint256 amount);
  event Withdrawn(address token, uint256 amount);

    function deposit(address token, uint256 amount) external override {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        emit Deposited(token, amount);
    }

    function withdraw(address token, uint256 amount) external override {
        IERC20(token).transfer(msg.sender, amount);
        emit Withdrawn(token, amount);
    }
}