// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Lab2Token is ERC20 {
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    constructor() ERC20("VTest", "VTest") {
        _mint(msg.sender, 100000000 * (10 ** decimals()));
    }
}