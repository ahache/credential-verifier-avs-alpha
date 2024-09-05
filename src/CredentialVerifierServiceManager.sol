// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

// import "@eigenlayer/contracts/libraries/BytesLib.sol";
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
    // Keep this around in case deciding to use OZ recover function
    // using ECDSAUpgradeable for bytes32;

    uint32 public latestTaskNum;

    mapping(uint256 taskId => bytes32 taskHash) public allTaskHashes;

    // Operators end up storing the credentialIssuer address for each taskId
    // Will keep this for now but will update to improved reputation system later
    mapping(address operator => mapping(uint256 taskId => address credentialIssuer)) public taskResponses;

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

    // Helper function to create a hash from signature components
    function signatureHash(bytes32 r, bytes32 s) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(r, s));
    }

    function createTask(string memory credential, bytes32 r, bytes32 s) external {
        // Create a new task hash using the signature components
        bytes32 taskHash = signatureHash(r, s);

        // Store the hash of the task on-chain
        allTaskHashes[latestTaskNum] = taskHash;

        // Emit an event for the new task creation
        emit TaskCreated(latestTaskNum, credential);

        // Increment the latest task number
        latestTaskNum++;
    }

    function respondToTask(
        uint256 taskId,
        bytes32 messageHash,
        bytes32 r,
        bytes32 s,
        uint8 v,
        address credentialIssuerEthAddress
    ) external onlyOperator {
        // Hash the r and s values
        bytes32 taskHash = signatureHash(r, s);

        // Check if the task hash matches the stored hash for the given taskId
        require(allTaskHashes[taskId] == taskHash, "Task hash does not match");

        // Recover the signer's address using ecrecover
        address recoveredSigner = ecrecover(messageHash, v, r, s);

        // Check if the recovered signer matches the provided credentialIssuerEthAddress
        require(recoveredSigner == credentialIssuerEthAddress, "Invalid signature");

        // Store the signerAddress directly as an address
        taskResponses[msg.sender][taskId] = credentialIssuerEthAddress;

        // Emit the TaskResponded event
        emit TaskResponded(taskId, msg.sender);
    }

}