import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { credentialVerifierABI } from './abis/credentialVerifierABI';
import { verifierAgent } from "./verifier-setup";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const credentialVerifierAddress = process.env.CREDENTIAL_VERIFIER_ADDRESS!;

const credentialVerifierContract = new ethers.Contract(credentialVerifierAddress, credentialVerifierABI, wallet);

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

const monitorNewTasks = async () => {
    credentialVerifierContract.on("TaskCreated", async (latestTaskNum: number, credential: string, credentialHash: string) => {
        console.log(`New task detected`);
        await verifyCredentialAndSign(latestTaskNum, credential, credentialHash);
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