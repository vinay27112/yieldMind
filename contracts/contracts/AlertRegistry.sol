// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;  

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AlertRegistry is AccessControl {
  bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");

  struct Alert {
    address token;
    uint256 threshold;
    uint8 direction; // 0 for below, 1 for above
    bool isActive;
    uint256 lastTriggered;
  }
    mapping(address => Alert[]) userAlerts; // Mapping of user to their alerts

    event AlertSet(address indexed user, address token, uint256 threshold, uint8 direction);
    event AlertTriggered(address indexed user, address token, uint256 threshold);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(KEEPER_ROLE, msg.sender);
    }

    function setAlert(address token, uint256 threshold, uint8 direction) external {
        require(direction == 0 || direction == 1, "Direction must be 0 (below) or 1 (above)");
        userAlerts[msg.sender].push(Alert(token, threshold, direction, true, 0));
        emit AlertSet(msg.sender, token, threshold, direction);
    }

    function deactivateAlert(uint256 index) external {
        require(index < userAlerts[msg.sender].length, "Invalid alert index");
        userAlerts[msg.sender][index].isActive = false;
    }

    function triggerAlert(address user, address token, uint256 price) external onlyRole(KEEPER_ROLE) {
        Alert[] storage alerts = userAlerts[user];
        for (uint256 i = 0; i < alerts.length; i++) {
            Alert storage alert = alerts[i];
            if (alert.isActive && alert.token == token) {
                if ((alert.direction == 0 && price < alert.threshold) || (alert.direction == 1 && price > alert.threshold)) {
                  require(block.timestamp >= alert.lastTriggered + 1 hours,"Alert already triggered recently");
                    alert.lastTriggered = block.timestamp;
                    emit AlertTriggered(user, token, alert.threshold);
                }
            }
        }
    }

    function getAlerts(address user) external view returns (Alert[] memory) {
        return userAlerts[user];
    }
  

}