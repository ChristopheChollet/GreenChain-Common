// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Minimal oracle used in the MVP to simulate a "grid congestion factor".
/// factorBps = 10_000 means 1.0x (no change). 12_000 means 1.2x.
contract MockGridOracle {
    uint256 public factorBps;

    event FactorUpdated(uint256 oldFactorBps, uint256 newFactorBps);

    error InvalidFactor();

    constructor(uint256 _factorBps) {
        if (_factorBps < 1_000 || _factorBps > 100_000) revert InvalidFactor();
        factorBps = _factorBps;
    }

    function setFactorBps(uint256 _factorBps) external {
        if (_factorBps < 1_000 || _factorBps > 100_000) revert InvalidFactor();
        emit FactorUpdated(factorBps, _factorBps);
        factorBps = _factorBps;
    }
}
