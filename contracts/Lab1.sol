// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Lab1 {
    address payable public owner;

    event ETHReceived(address indexed sender, uint256 amount);

    constructor() {
        owner = payable(msg.sender);
    }

    receive() external payable {
        emit ETHReceived(msg.sender, msg.value);
    }

    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Transfer failed");
    }
}
