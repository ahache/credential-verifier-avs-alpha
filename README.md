## Verifiable Credential Verifier AVS

This is a proof of concept for a Credential Verifier built as an EigenLayer Actively Validated Service (AVS). 

Key features and goals:
- Clients (subjects, issuers, etc.) can verify JWT credentials, establishing their verification on chain and enhancing the issuers' reputation.
- AVS operators verify credentials off-chain and pass necessary data to the AVS contract, where the credential signature is checked against the issuer's public key (converted to an Ethereum address equivalent).
- Further data about the issuer, subject and credential can be written on chain.
- A public track record of issuer claims can be established.

## Development

### Requirements

- [Foundry](https://book.getfoundry.sh/getting-started/installation)

### Setup and Run

1. **Install Dependencies:**
    ```sh
    ./bin/install_dependencies.sh
    ```

2. **Start Anvil:**
    In a separate terminal window, run:
    ```sh
    anvil
    ```

3. **Deploy Contracts and Register Operator:**
    ```sh
    ./bin/deploy_and_register.sh
    ```

4. **Run Operator:**
    ```sh
    npx tsx operator/index.ts
    ```

5. **Create a Task:**
    Once the setup is complete, you can create a task by running:
    ```sh
    npx tsx operator/createTask.ts
    ```

### Updating the TypeScript ABI

If updating `CredentialVerifierServiceManager.sol`, update the TypeScript ABI after running `forge build`. 

**Make sure `jq` is installed locally, then run:**
```sh
./bin/update_service_manager_abi.sh
```
