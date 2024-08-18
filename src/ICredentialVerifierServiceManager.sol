// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICredentialVerifierServiceManager {
    event TaskCreated(uint256 indexed taskId, string credential, bytes32 credentialHash);
    event TaskResponded(uint256 indexed taskId, address operator);

    function createTask(string memory credential) external;

    function respondToTask(uint256 taskId, bytes32 credentialHash, bytes calldata signature) external;
}

