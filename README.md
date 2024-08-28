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

3. **Deploy and Run:**
    In another terminal window, run:
    ```sh
    ./bin/deploy_and_run.sh
    ```

4. **Updating the TypeScript ABI:**
    
    If updating `CredentialVerifierServiceManager.sol`, update the TypeScript ABI after running `forge build`. 
    
    **Make sure `jq` is installed locally:**
    ```sh
    ./bin/update_service_manager_abi.sh
    ```

5. **Create a Task:**
    Once the setup is complete, you can create a task by running:
    ```sh
    npx tsx operator/createTask.ts
    ```

### Notes and Troubleshooting

- If you want to leave Anvil and deployments in place while updating the operator logic, comment out the `registerOperator` call in `main` in `operator/index.ts`.