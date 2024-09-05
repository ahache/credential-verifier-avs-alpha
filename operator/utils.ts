import { ethers } from 'ethers';
import { Buffer } from 'buffer';
import crypto from 'crypto';
import EthCrypto from 'eth-crypto';

interface DataForEVM {
  messageHash: string;
  validSignature: ethers.Signature;
  signerEthAddress: string;
}

interface VerificationMethod {
    type: string;
    publicKeyHex?: string;
    publicKeyBase64?: string;
}
  
interface DIDDocument {
  verificationMethod?: VerificationMethod[];
}

// Helper function to create message hash
function createMessageHash(headerB64: string, payloadB64: string): string {
  const message = `${headerB64}.${payloadB64}`;
  const messageBuffer = Buffer.from(message, 'utf-8');
  return crypto.createHash('sha256').update(messageBuffer).digest('hex');
}

// Helper function to decode base64 signature
function decodeSignature(signatureB64: string): Buffer {
  return Buffer.from(signatureB64, 'base64');
}

// Helper function to create and verify signatures
function createAndVerifySignatures(signatureBuffer: Buffer, messageHash: string, signerEthAddress: string): ethers.Signature {
  const signatures = [0n, 1n].map(v => 
    ethers.Signature.from({
      r: '0x' + signatureBuffer.subarray(0, 32).toString('hex'),
      s: '0x' + signatureBuffer.subarray(32, 64).toString('hex'),
      v: v
    })
  );

  for (const sig of signatures) {
    const compositeSignature = ethers.hexlify(ethers.concat([
      sig.r,
      sig.s,
      ethers.toBeHex(sig.v, 1)
    ]));
    
    const recoveredSigner = EthCrypto.recover(compositeSignature, messageHash);
    
    if (recoveredSigner.toLowerCase() === signerEthAddress.toLowerCase()) {
      return sig;
    }
  }

  throw new Error('No matching signature found');
}

export function prepareDataForEVM(jwt: string, publicKeyHex: string): DataForEVM {
  // Error handling for invalid JWT format
  if (jwt.split('.').length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [headerB64, payloadB64, signatureB64] = jwt.split('.');

  const messageHash = createMessageHash(headerB64, payloadB64);
  const signatureBuffer = decodeSignature(signatureB64);

  // Convert public key to Ethereum address
  const signerEthAddress = EthCrypto.publicKey.toAddress(publicKeyHex);

  const validSignature = createAndVerifySignatures(signatureBuffer, messageHash, signerEthAddress);

  return {
    messageHash: "0x" + messageHash,
    validSignature,
    signerEthAddress
  };
}

export const extractPublicKey = (didDocument: DIDDocument): string | null => {
    if (!didDocument.verificationMethod || !Array.isArray(didDocument.verificationMethod)) {
      throw new Error('Invalid DID document: verificationMethod is missing or not an array');
    }
  
    const secp256k1Method = didDocument.verificationMethod.find(method => 
      method.type.toLowerCase().includes('secp256k1verificationkey')
    );
  
    if (!secp256k1Method) {
      return null;
    }
  
    if (secp256k1Method.publicKeyHex) {
      return secp256k1Method.publicKeyHex;
    }
  
    if (secp256k1Method.publicKeyBase64) {
      // Convert base64 to hex
      return Buffer.from(secp256k1Method.publicKeyBase64, 'base64').toString('hex');
    }
  
    throw new Error('No supported public key format found for secp256k1 verification method');
};
