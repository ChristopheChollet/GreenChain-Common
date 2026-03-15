// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./mocks/MockGridOracle.sol";

/// @title GridFlexMarket (MVP)
/// @notice Simple market for time-slots of energy flexibility.
/// Payments are in native ETH for simplicity.
contract GridFlexMarket {
    enum SlotStatus {
        Open,
        Matched,
        Cancelled
    }

    struct Slot {
        address producer;
        address consumer; // set when matched
        uint40 startTime; // unix seconds
        uint40 endTime; // unix seconds
        uint128 energyWh; // energy amount in Wh (MVP unit)
        uint128 pricePerWhWei; // base price per Wh in wei
        SlotStatus status;
    }

    MockGridOracle public immutable oracle;
    uint256 public nextSlotId;

    mapping(uint256 => Slot) private _slots;

    event SlotCreated(
        uint256 indexed slotId,
        address indexed producer,
        uint40 startTime,
        uint40 endTime,
        uint128 energyWh,
        uint128 pricePerWhWei
    );

    event SlotMatched(
        uint256 indexed slotId,
        address indexed producer,
        address indexed consumer,
        uint256 paidWei,
        uint256 oracleFactorBps
    );

    event SlotCancelled(uint256 indexed slotId, address indexed producer);

    error ZeroAddress();
    error InvalidTimeWindow();
    error ZeroAmount();
    error NotProducer();
    error NotOpen();
    error SlotNotFound();
    error IncorrectPayment(uint256 expectedWei, uint256 receivedWei);

    constructor(address _oracle) {
        if (_oracle == address(0)) revert ZeroAddress();
        oracle = MockGridOracle(_oracle);
    }

    function getSlot(uint256 slotId) external view returns (Slot memory) {
        Slot memory s = _slots[slotId];
        if (s.producer == address(0)) revert SlotNotFound();
        return s;
    }

    /// @notice Quotes the ETH amount required to match a slot, using the oracle factor.
    function quoteMatch(uint256 slotId) public view returns (uint256 totalWei, uint256 factorBps) {
        Slot memory s = _slots[slotId];
        if (s.producer == address(0)) revert SlotNotFound();
        if (s.status != SlotStatus.Open) revert NotOpen();

        factorBps = oracle.factorBps();
        // base = energyWh * pricePerWhWei
        uint256 baseWei = uint256(s.energyWh) * uint256(s.pricePerWhWei);
        totalWei = (baseWei * factorBps) / 10_000;
    }

    /// @notice Producer creates a new slot.
    function createSlot(
        uint40 startTime,
        uint40 endTime,
        uint128 energyWh,
        uint128 pricePerWhWei
    ) external returns (uint256 slotId) {
        if (endTime <= startTime) revert InvalidTimeWindow();
        if (energyWh == 0 || pricePerWhWei == 0) revert ZeroAmount();

        slotId = nextSlotId++;
        _slots[slotId] = Slot({
            producer: msg.sender,
            consumer: address(0),
            startTime: startTime,
            endTime: endTime,
            energyWh: energyWh,
            pricePerWhWei: pricePerWhWei,
            status: SlotStatus.Open
        });

        emit SlotCreated(slotId, msg.sender, startTime, endTime, energyWh, pricePerWhWei);
    }

    /// @notice Producer can cancel a slot while it's open.
    function cancelSlot(uint256 slotId) external {
        Slot storage s = _slots[slotId];
        if (s.producer == address(0)) revert SlotNotFound();
        if (s.producer != msg.sender) revert NotProducer();
        if (s.status != SlotStatus.Open) revert NotOpen();

        s.status = SlotStatus.Cancelled;
        emit SlotCancelled(slotId, msg.sender);
    }

    /// @notice Consumer matches a slot by paying the quoted amount.
    function matchSlot(uint256 slotId) external payable {
        Slot storage s = _slots[slotId];
        if (s.producer == address(0)) revert SlotNotFound();
        if (s.status != SlotStatus.Open) revert NotOpen();

        (uint256 expectedWei, uint256 factorBps) = quoteMatch(slotId);
        if (msg.value != expectedWei) revert IncorrectPayment(expectedWei, msg.value);

        s.consumer = msg.sender;
        s.status = SlotStatus.Matched;

        // MVP: pay producer immediately
        (bool ok, ) = payable(s.producer).call{ value: msg.value }("");
        require(ok, "PAY_FAIL");

        emit SlotMatched(slotId, s.producer, msg.sender, msg.value, factorBps);
    }
}
