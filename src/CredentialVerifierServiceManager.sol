// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@eigenlayer/contracts/libraries/BytesLib.sol";
import "@eigenlayer/contracts/core/DelegationManager.sol";
import "@eigenlayer-middleware/src/unaudited/ECDSAServiceManagerBase.sol";
import "@eigenlayer-middleware/src/unaudited/ECDSAStakeRegistry.sol";
import "@openzeppelin-upgrades/contracts/utils/cryptography/ECDSAUpgradeable.sol";
import "@eigenlayer/contracts/permissions/Pausable.sol";
import {IRegistryCoordinator} from "@eigenlayer-middleware/src/interfaces/IRegistryCoordinator.sol";
import "./ICredentialVerifierServiceManager.sol";

contract CredentialVerifierServiceManager is 
    ICredentialVerifierServiceManager,
    ECDSAServiceManagerBase
{
    using BytesLib for bytes;
    using ECDSAUpgradeable for bytes32;

    /* STORAGE */
    // The latest task index
    uint32 public latestTaskNum;

    // mapping of task indices to all tasks hashes
    // when a task is created, task hash is stored here,
    // and responses need to pass the actual task,
    // which is hashed onchain and checked against this mapping
    // CV: this would contain the hash of the credential
    mapping(uint256 => bytes32) public allTaskHashes;

    // mapping of task indices to hash of abi.encode(taskResponse, taskResponseMetadata)
    // CV: this would contain the signed hash of the credential
    mapping(address => mapping(uint256 => bytes)) public allTaskResponses;

    /* MODIFIERS */
    modifier onlyOperator() {
        require(
            ECDSAStakeRegistry(address(stakeRegistry)).operatorRegistered(msg.sender) 
            == 
            true, 
            "Operator must be the caller"
        );
        _;
    }

    constructor(
        address _avsDirectory,
        address _stakeRegistry,
        address _delegationManager
    )
        ECDSAServiceManagerBase(
            _avsDirectory,
            _stakeRegistry,
            address(0),
            _delegationManager
        )
    {}

    function createTask(string memory credential) external {
        // Create a new task hash directly from the credential
        bytes32 credentialHash = keccak256(abi.encode(credential));

        // Store the hash of the task on-chain
        allTaskHashes[latestTaskNum] = credentialHash;

        // Emit an event for the new task creation
        // The credential has to be emit here in string format for verifier
        emit TaskCreated(latestTaskNum, credential, credentialHash);

        // Increment the latest task number
        latestTaskNum = latestTaskNum + 1;
    }

    function respondToTask(uint256 taskId, bytes32 credentialHash, bytes calldata signature) external onlyOperator {
        require(allTaskHashes[taskId] == credentialHash, "Credential hash does not match task");
        require(allTaskResponses[msg.sender][taskId].length == 0, "Task already responded to");
        
        bytes32 ethSignedCredentialHash = credentialHash.toEthSignedMessageHash();
        address signer = ethSignedCredentialHash.recover(signature);
        require(signer == msg.sender, "Invalid signature, not operator");

        allTaskResponses[msg.sender][taskId] = signature;

        emit TaskResponded(taskId, msg.sender);
    }

}