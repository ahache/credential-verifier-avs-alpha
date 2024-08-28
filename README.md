## Verifiable Credential Verifier AVS

Credential Verifier proof of concept built as an EigenLayer Actively Validated Service

#### Requirements

- [Foundry](https://book.getfoundry.sh/getting-started/installation)

#### Setup and Run

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
    ```sh
    ./bin/deploy_and_run.sh
    ```

4. **Create a Task:**
    Once the setup is complete, you can create a task by running:
    ```sh
    npx tsx operator/createTask.ts
    ```

#### Notes and Troubleshooting
- Update `credentialVerifierABI.ts` if updating contract function signatures or adding functions
- If you want to leave anvil and deployments in place while updating the operator logic, comment out `registerOperator` call in `main` in `operator/index.ts`