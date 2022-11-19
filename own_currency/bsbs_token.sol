// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

contract BSBSToken is ERC20 {
    // our constructor should call our constructor 
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        // msg.sender = EVM global variable
        // _mint internal ERC20 function
        // mint 10 full tokens in your address
        // each ERC20 token is represented as 10 ** 18 
        _mint(msg.sender, 10 * 10 ** 18);
    }
}