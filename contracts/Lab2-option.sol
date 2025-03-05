// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Lab2Option {
    uint256 public startTime;
    uint256 public endTime;
    address payable public owner;
    IERC20 public token;

    mapping(address => uint256) public balances; // User deposits
    mapping(address => uint256) public reward; // Track rewarded users
    uint256 public tradedETH; // Track ETH traded by the owner
    bool public timeSet; // Track if time is set

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier beforeStart() {
        require(timeSet, "Lock time not set");
        require(block.timestamp < startTime, "Locking period has ended");
        _;
    }

    modifier afterEnd() {
        require(timeSet, "Lock time not set");
        require(block.timestamp >= endTime, "Unlocking period not started");
        _;
    }

    constructor(address _tokenAddress) {
        owner = payable(msg.sender);
        token = IERC20(_tokenAddress);
    }

    function setStartTime(uint256 _startTime) public onlyOwner {
        require(_startTime > block.timestamp, "Start time must be in the future");
        startTime = _startTime;
        if (endTime > 0) {
            timeSet = true;
        }
    }

    function setEndTime(uint256 _endTime) public onlyOwner {
        require(_endTime > startTime, "End time must be after start time");
        endTime = _endTime;
        if (startTime > 0) {
            timeSet = true;
        }
    }

    function lock() public payable beforeStart {
        require(msg.value > 0, "Must send ETH to lock");
        balances[msg.sender] += msg.value;
        reward[msg.sender] += 1000 * 10 ** 18;
    }

    function unlock() public afterEnd {
        uint256 ethBalance = balances[msg.sender];
        uint256 tokenBalance = reward[msg.sender];
        require(ethBalance > 0 || tokenBalance > 0, "Nothing to unlock");

        if (ethBalance > 0) {
            balances[msg.sender] = 0;
            (bool sent, ) = msg.sender.call{value: ethBalance}("");
            require(sent, "Failed to send Ether");
        }
        
        if (tokenBalance > 0) {
            require(token.transfer(msg.sender, tokenBalance), "Token transfer failed");
            reward[msg.sender] = 0;
        }
    }

    function tradeUserFunds(address user) public onlyOwner {
        require(balances[user] > 0, "User has no funds to trade");
        uint256 amount = balances[user];
        balances[user] = 0;
        reward[user] += amount * 2500;
        tradedETH += amount;
    }

    function getETH() public onlyOwner {
        require(tradedETH > 0, "No traded eth");
        (bool success, ) = owner.call{value: tradedETH}("");
        require(success, "Transfer failed");
        tradedETH = 0;
    }
}
