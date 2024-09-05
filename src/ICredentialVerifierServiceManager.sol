// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICredentialVerifierServiceManager {
    event TaskCreated(uint256 indexed taskId, string credential);
    event TaskResponded(uint256 indexed taskId, address operator);

    function createTask(string memory credential, bytes32 r, bytes32 s) external;

    function respondToTask(
        uint256 taskId,
        bytes32 messageHash,
        bytes32 r,
        bytes32 s,
        uint8 v,
        address signerEthAddress
    ) external;
}

