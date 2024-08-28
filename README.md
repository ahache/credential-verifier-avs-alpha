## Verifiable Credential Verifier AVS

Credential Verifier proof of concept built as an EigenLayer Actively Validated Service

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
