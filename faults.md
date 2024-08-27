### Operator faults

- Operators are expected to sign the hash of a successfully verified credential. This signature is then written on chain as an attestation. 

- Although it may be possible in some cases, the credential verification process would generally not be objectively verifiable on chain. This would prevent objectively attributable fault detection. Using ZK might be possible if the scope of credential/signature type is limited, which could be the case in similar AVSs that perform a very specific role.

- Otherwise this AVS would need to rely on intersubjectively attributable fault detection. Operators would need to be monitored by entities that can submit a proof of rouge behavior.

