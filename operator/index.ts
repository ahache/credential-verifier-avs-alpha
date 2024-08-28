import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { delegationABI } from "./abis/delegationABI";
import { credentialVerifierABI } from './abis/credentialVerifierABI';
import { registryABI } from './abis/registryABI';
import { avsDirectoryABI } from './abis/avsDirectoryABI';

import { verifierAgent } from "./verifier-setup";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const delegationManagerAddress = process.env.DELEGATION_MANAGER_ADDRESS!;
const credentialVerifierAddress = process.env.CREDENTIAL_VERIFIER_ADDRESS!;
const stakeRegistryAddress = process.env.STAKE_REGISTRY_ADDRESS!;
const avsDirectoryAddress = process.env.AVS_DIRECTORY_ADDRESS!;

const delegationManager = new ethers.Contract(delegationManagerAddress, delegationABI, wallet);
const credentialVerifierContract = new ethers.Contract(credentialVerifierAddress, credentialVerifierABI, wallet);
const registryContract = new ethers.Contract(stakeRegistryAddress, registryABI, wallet);
const avsDirectory = new ethers.Contract(avsDirectoryAddress, avsDirectoryABI, wallet);

const verifyCredentialAndSign = async (taskId: number, credential: string, credentialHash: string) => {
    // parse and verify credential
    const credentialObject = JSON.parse(credential);
    const result = await verifierAgent.verifyCredential({ credential: credentialObject })
    // if verified, sign the credential hash
    if (result.verified) {
        console.log("Credential verified");
        const credentialHashBytes = ethers.getBytes(credentialHash);
        const signature = await wallet.signMessage(credentialHashBytes);
        
        const tx = await credentialVerifierContract.respondToTask(taskId, credentialHash, signature);
        const receipt = await tx.wait();
        console.log("Transaction receipt:", receipt);
    } else {
        console.log("Credential not verified");
        // throw new Error("Credential not verified");
    }
};

const registerOperator = async () => {
    const tx1 = await delegationManager.registerAsOperator({
        earningsReceiver: await wallet.address,
        delegationApprover: "0x0000000000000000000000000000000000000000",
        stakerOptOutWindowBlocks: 0
    }, "");
    await tx1.wait();
    console.log("Operator registered on EL successfully");

    const salt = ethers.getBytes(ethers.randomBytes(32));
    const expiry = Math.floor(Date.now() / 1000) + 3600; // Example expiry, 1 hour from now

    // Define the output structure
    let operatorSignature = {
        expiry: expiry,
        salt: salt,
        signature: ""
    };

    // Calculate the digest hash using the avsDirectory's method
    const digestHash = await avsDirectory.calculateOperatorAVSRegistrationDigestHash(
        wallet.address, 
        credentialVerifierAddress, 
        salt, 
        expiry
    );

    // // Sign the digest hash with the operator's private key
    const signingKey = new ethers.SigningKey(process.env.PRIVATE_KEY!);
    const signature = signingKey.sign(digestHash);
    
    // // Encode the signature in the required format
    const sig = ethers.Signature.from(signature);
    operatorSignature.signature = sig.serialized;

    const tx2 = await registryContract.registerOperatorWithSignature(
        operatorSignature,
        wallet.address
    );
    await tx2.wait();
    console.log("Operator registered on AVS successfully");
};

const monitorNewTasks = async () => {
    credentialVerifierContract.on("TaskCreated", async (latestTaskNum: number, credential: string, credentialHash: string) => {
        console.log(`New task detected`);
        await verifyCredentialAndSign(latestTaskNum, credential, credentialHash);
    });

    console.log("Monitoring for new tasks...");
};

const main = async () => {
    await registerOperator();
    monitorNewTasks().catch((error) => {
        console.error("Error monitoring tasks:", error);
    });
};

main().catch((error) => {
    console.error("Error running operator:", error);
});