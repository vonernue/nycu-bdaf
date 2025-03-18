// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

contract Lab3Withdrawer is Ownable {
    constructor(address _owner) Ownable(_owner) {}

    function withdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens");
        IERC20(token).transfer(owner(), balance);
    }
}

contract Lab3Factory {
    event Deployed(address addr);

    function deployWithdrawer(address _owner, bytes32 _salt) external returns (address) {
        bytes memory bytecode = abi.encodePacked(
            type(Lab3Withdrawer).creationCode,
            abi.encode(_owner)
        );
        address deployedAddr = Create2.deploy(0, _salt, bytecode);
        emit Deployed(deployedAddr);
        return deployedAddr;
    }

    function computeAddress(address _owner, bytes32 _salt) external view returns (address) {
        bytes memory bytecode = abi.encodePacked(
            type(Lab3Withdrawer).creationCode,
            abi.encode(_owner)
        );
        return Create2.computeAddress(_salt, keccak256(bytecode), address(this));
    }
}