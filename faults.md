## Operator Faults

### Objectively Attributable Fault Detection

The credential verification process uses objectively attributable fault detection:

1. Operators verify credentials off-chain.
2. Relevant data is passed to the contract.
3. The contract verifies the credential signature against the issuer's public key (Ethereum address equivalent).
4. Signature components must be provided when creating a task and issuer signing keys must be generated from the secp256k1 curve.

### Intersubjectively Attributable Fault Detection

- Additional information can be written on-chain.
- Operators may perform other off-chain tasks.
- Some of these tasks may require intersubjective fault detection (further details to be specified).
