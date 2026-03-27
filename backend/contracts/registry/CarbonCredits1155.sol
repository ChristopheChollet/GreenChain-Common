// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Demo carbon-offset units (ERC-1155). Only `GreenRecsRegistry` may mint, in lockstep with REC issuance.
contract CarbonCredits1155 is ERC1155, Ownable {
    address public registry;
    uint256 public constant CREDIT_TOKEN_ID = 1;

    event CarbonCreditsMinted(address indexed to, uint256 amount);

    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

    function setRegistry(address _registry) external onlyOwner {
        require(registry == address(0), "Registry already set");
        require(_registry != address(0), "Invalid registry");
        registry = _registry;
    }

    function mintFromRecIssue(address to, uint256 amount) external {
        require(msg.sender == registry, "Only registry");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount is zero");
        _mint(to, CREDIT_TOKEN_ID, amount, "");
        emit CarbonCreditsMinted(to, amount);
    }

    function uri(uint256 id) public pure override returns (string memory) {
        require(id == CREDIT_TOKEN_ID, "Unknown token");
        return "https://greenchain.common/metadata/carbon-credit-v1";
    }
}
