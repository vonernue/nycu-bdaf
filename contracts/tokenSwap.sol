// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract TokenSwap {
    IERC20Metadata public tokenA;
    IERC20Metadata public tokenB;
    uint256 public constant RATIO = 3;
    uint8 public decimalsA;
    uint8 public decimalsB;

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20Metadata(_tokenA);
        tokenB = IERC20Metadata(_tokenB);
        decimalsA = tokenA.decimals();
        decimalsB = tokenB.decimals();
    }

    function swapAToB(uint256 amount) external {
        tokenA.transferFrom(msg.sender, address(this), amount);
        uint256 amountB = (amount * RATIO * (10 ** decimalsB)) / (10 ** decimalsA);
        tokenB.transfer(msg.sender, amountB);
    }

    function swapBToA(uint256 amount) external {
        tokenB.transferFrom(msg.sender, address(this), amount);
        uint256 amountA = (amount * (10 ** decimalsA)) / (RATIO * (10 ** decimalsB));
        tokenA.transfer(msg.sender, amountA);
    }
}