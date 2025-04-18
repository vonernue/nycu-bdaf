// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationVault is ERC20, Ownable {
    IERC20 public underlyingToken;
    uint256 public sharePrice = 1e18; // 1 share = 1 token initially

    constructor(
        address _owner,
        address _underlyingToken
    ) ERC20("DonationVaultShare", "DVS") Ownable(_owner) {
        require(_underlyingToken != address(0), "Invalid token address");
        underlyingToken = IERC20(_underlyingToken);
    }

    function deposit(uint256 _amountUnderlying) external {
        updateSharePrice();

        require(_amountUnderlying > 0, "Amount must be greater than zero");
        uint256 sharesToMint = (_amountUnderlying * 1e18) / sharePrice;

        _mint(msg.sender, sharesToMint);

        require(
            underlyingToken.transferFrom(msg.sender, address(this), _amountUnderlying),
            "Transfer failed"
        );
    }

    function withdraw(uint256 _amountShares) external {
        updateSharePrice();

        require(_amountShares > 0, "Amount must be greater than zero");
        require(balanceOf(msg.sender) >= _amountShares, "Insufficient shares");

        uint256 underlyingToReturn = (_amountShares * sharePrice) / 1e18;

        _burn(msg.sender, _amountShares);

        require(
            underlyingToken.transfer(msg.sender, underlyingToReturn),
            "Transfer failed"
        );
    }

    function takeFeeAsOwner(uint256 _amountUnderlying) external onlyOwner {
        require(_amountUnderlying > 0, "Amount must be greater than zero");
        require(
            underlyingToken.balanceOf(address(this)) >= _amountUnderlying,
            "Insufficient funds in vault"
        );

        require(
            underlyingToken.transfer(owner(), _amountUnderlying),
            "Transfer failed"
        );

        updateSharePrice();
    }

    function updateSharePrice() internal {
        uint256 vaultBalance = underlyingToken.balanceOf(address(this));
        uint256 totalShares = totalSupply(); // Use ERC20's totalSupply
        if (totalShares > 0) {
            sharePrice = (vaultBalance * 1e18) / totalShares;
        }
    }
}