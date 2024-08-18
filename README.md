## Verifiable Credential Verifier AVS

Credential Verifier built as an EigenLayer Actively Validated Service

#### Requirements

- Foundry

#### Setup and Run

- `yarn install`
- `cd contracts`
    - `forge install`
    - `forge build`
- Start Anvil in seperate terminal: `anvil`
- In a separate terminal window, deploy the EigenLayer contracts. To do so, change directory to `contracts/lib/eigenlayer-middleware/lib/eigenlayer-contracts` and run the following commands:

```sh
forge script script/deploy/devnet/M2_Deploy_From_Scratch.s.sol --rpc-url http://localhost:8545 \
--private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast \
--sig "run(string memory configFile)" -- M2_deploy_from_scratch.anvil.config.json
```
- copy `contracts/lib/eigenlayer-middleware/lib/eigenlayer-contracts/script/output/devnet/eigenlayer_deployment_output.json` to `contracts/script/output/31337/eigenlayer_deployment_output.json`
- In a separate terminal window, deploy the AVS contracts. Change directory to `contracts` and run:

```sh
forge script script/CredentialVerifierDeployer.s.sol --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast -v
```
- Run the operator: `npx tsx operator/index.ts`
- Create a task: `npx tsx operator/createTask.ts`

#### Notes and Troubleshooting
- Update `credentialVerifierABI.ts` if updating contract function signatures or adding functions
