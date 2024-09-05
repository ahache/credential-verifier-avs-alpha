import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { credentialVerifierABI } from './abis/credentialVerifierABI';
import { verifierAgent } from "./verifier-setup";
import { extractPublicKey, prepareDataForEVM } from "./utils";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const credentialVerifierAddress = process.env.CREDENTIAL_VERIFIER_ADDRESS!;

const credentialVerifierContract = new ethers.Contract(credentialVerifierAddress, credentialVerifierABI, wallet);

const verifyCredentialAndSign = async (taskId: number, credential: string) => {
    try {
        // parse and verify credential
        const credentialObject = JSON.parse(credential);
        const result = await verifierAgent.verifyCredential({ credential: credentialObject });

        // if verified, prepare data for EVM
        if (result.verified) {
            console.log("Credential verified");
            
            // Extract public key from DID document
            const publicKeyHex = extractPublicKey(result.didResolutionResult.didDocument);
            if (!publicKeyHex) {
                throw new Error("Failed to extract public key from DID document");
            }

            // Prepare data for EVM
            const { messageHash, validSignature, signerEthAddress } = prepareDataForEVM(credentialObject.proof.jwt, publicKeyHex);

            // Call the smart contract function with the prepared data
            const tx = await credentialVerifierContract.respondToTask(
                taskId,
                messageHash,
                validSignature.r,
                validSignature.s,
                validSignature.v,
                signerEthAddress
            );
            const receipt = await tx.wait();
            // Can add something more useful here
            console.log("Transaction receipt:", receipt);
        } else {
            console.log("Credential not verified");
        }
    } catch (error) {
        console.error("Error in verifyCredentialAndSign:", error);
        // Handle the error appropriately
    }
};

const monitorNewTasks = async () => {
    credentialVerifierContract.on("TaskCreated", async (latestTaskNum: number, credential: string) => {
        console.log(`New task detected`);
        await verifyCredentialAndSign(latestTaskNum, credential);
    });

    console.log("Monitoring for new tasks...");
};

const main = async () => {
    monitorNewTasks().catch((error) => {
        console.error("Error monitoring tasks:", error);
    });
};

main().catch((error) => {
    console.error("Error running operator:", error);
});