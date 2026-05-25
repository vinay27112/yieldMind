// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;  

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ILendingProtocol.sol";

contract YieldVault is AccessControl, ReentrancyGuard, Pausable  {
  bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
  bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");

    // user => token => deposited amount
  mapping(address => mapping(address => uint256)) public balances;

  // user => token => which protocol holds their funds
  mapping(address => mapping(address => address)) public activeProtocol;

  // whitelisted protocol adapters
  mapping(address => bool) public approvedProtocols;

  // whitelisted tokens
  mapping(address => bool) public supportedTokens;

    event Deposited(
      address indexed user,
      address indexed token,
      uint256 amount,
      address protocol
  );

  event Withdrawn(
      address indexed user,
      address indexed token,
      uint256 amount
  );

  event Rebalanced(
      address indexed user,
      address indexed token,
      address fromProtocol,
      address toProtocol
  );

  constructor() {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(MANAGER_ROLE, msg.sender);
    _grantRole(KEEPER_ROLE, msg.sender); 
  }

  function addProtocol(address _protocol) external onlyRole(MANAGER_ROLE) {
      approvedProtocols[_protocol] = true;
  }

  function addToken(address _token) external onlyRole(MANAGER_ROLE) {
      supportedTokens[_token] = true;
  }

  function pause() external onlyRole(MANAGER_ROLE) {
      _pause();
  }

  function unpause() external onlyRole(MANAGER_ROLE) {
      _unpause();
  }

  function getBalance(address _user, address _token) external view returns (uint256) {
      return balances[_user][_token];
  }

  function deposit(
    address _token,
    uint256 _amount,
    address _protocol
  ) external nonReentrant whenNotPaused {
    require(supportedTokens[_token], "Unsupported token");
    require(approvedProtocols[_protocol], "Unapproved protocol");
    require(_amount > 0, "Amount must be greater than zero");
    IERC20(_token).transferFrom(msg.sender, address(this), _amount);
    IERC20(_token).approve(_protocol, _amount);
    ILendingProtocol(_protocol).deposit(_token, _amount);
    balances[msg.sender][_token] += _amount;
    activeProtocol[msg.sender][_token] = _protocol;
    emit Deposited(msg.sender, _token, _amount, _protocol);
  }

  function withdraw(
    address _token,
    uint256 _amount
  ) external nonReentrant whenNotPaused {
    require(balances[msg.sender][_token] >= _amount, "Insufficient balance");
    address protocol = activeProtocol[msg.sender][_token];
    balances[msg.sender][_token] -= _amount;
    ILendingProtocol(protocol).withdraw(_token, _amount);
    IERC20(_token).transfer(msg.sender, _amount);
    emit Withdrawn(msg.sender, _token, _amount);
  }

  function rebalance(
    address _user,
    address _token,
    address _toProtocol
  ) external onlyRole(KEEPER_ROLE) nonReentrant whenNotPaused {
      address fromProtocol = activeProtocol[_user][_token];
      require(fromProtocol != _toProtocol, "Already in target protocol");
      require(approvedProtocols[_toProtocol], "Unapproved target protocol");
      uint256 userBalance = balances[_user][_token];
      require(userBalance > 0, "No balance to rebalance");
      // Check how much we actually have BEFORE withdrawing
      uint256 balanceBefore = IERC20(_token).balanceOf(address(this));

      // Withdraw from old protocol
      ILendingProtocol(fromProtocol).withdraw(_token, userBalance);

      // Check how much we actually received AFTER withdrawing
      uint256 balanceAfter = IERC20(_token).balanceOf(address(this));

      // Actual amount received — could be less than userBalance due to fees
      uint256 actualReceived = balanceAfter - balanceBefore;

      // Use actualReceived instead of userBalance for the next deposit
      IERC20(_token).approve(_toProtocol, actualReceived);
      ILendingProtocol(_toProtocol).deposit(_token, actualReceived);

      // Update user's balance to reflect actual amount (fees deducted)
      balances[_user][_token] = actualReceived;
      emit Rebalanced(_user, _token, fromProtocol, _toProtocol);
  }

}