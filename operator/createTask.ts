import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { credentialVerifierABI } from './abis/credentialVerifierABI';

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const contractAddress = process.env.CREDENTIAL_VERIFIER_ADDRESS!;
const contract = new ethers.Contract(contractAddress, credentialVerifierABI, wallet);

const webCredential = {
  credentialSubject: {
    Name: 'Alex',
    id: 'did:web:ahache.github.io:alex'
  },
  issuer: {
    id: 'did:web:ahache.github.io:alex'
  },
  type: ['VerifiableCredential', 'Profile'],
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://veramo.io/contexts/profile/v1'
  ],
  issuanceDate: '2024-08-12T09:47:49.000Z',
  proof: {
    type: 'JwtProof2020',
    jwt: 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vdmVyYW1vLmlvL2NvbnRleHRzL3Byb2ZpbGUvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlByb2ZpbGUiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiTmFtZSI6IkFsZXgifX0sInN1YiI6ImRpZDp3ZWI6YWhhY2hlLmdpdGh1Yi5pbzphbGV4IiwibmJmIjoxNzIzNDU2MDY5LCJpc3MiOiJkaWQ6d2ViOmFoYWNoZS5naXRodWIuaW86YWxleCJ9.jDAot5_wksRJABMJ6UJYdYtmLSr3AKrQpi77QjoNaZZXP_OgpYRo8Suc6mxRIaOd1rJKt_zJ3GO5hyqj8LTKdg'
  }
};

const ethrCredential = {
  credentialSubject: {
    you: 'Rock',
    id: 'did:web:example.com'
  },
  issuer: {
    id: 'did:ethr:sepolia:0x020ada7ac4e0e4a75fd921ff014dc5e7e9e408e94208beb43263aec3e06df1d3a0'
  },
  type: ['VerifiableCredential'],
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  issuanceDate: '2024-08-10T06:58:20.000Z',
  proof: {
    type: 'JwtProof2020',
    jwt: 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InlvdSI6IlJvY2sifX0sInN1YiI6ImRpZDp3ZWI6ZXhhbXBsZS5jb20iLCJuYmYiOjE3MjMyNzMxMDAsImlzcyI6ImRpZDpldGhyOnNlcG9saWE6MHgwMjBhZGE3YWM0ZTBlNGE3NWZkOTIxZmYwMTRkYzVlN2U5ZTQwOGU5NDIwOGJlYjQzMjYzYWVjM2UwNmRmMWQzYTAifQ.eIlW2oUfWO35hXG5neduG3faL10kpzyJiSwfzn46SMtdckIQWmD0XLbeoGyzIL1LNASfAn9oNWe0uczfXvGazQ'
  }
};

const createTask = async () => {
    const credential = webCredential;
    try {
        console.log("Creating task...");
        const credentialString = JSON.stringify(credential);
        const tx = await contract.createTask(credentialString);
        const receipt = await tx.wait();
        console.log("Task created successfully");
        console.log("Transaction receipt:", receipt);
    } catch (error) {
        console.error("Error creating task:", error);
    }
};

createTask().catch((error) => {
    console.error("Error running createTask:", error);
});