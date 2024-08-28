#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Get the directory of the current script
SCRIPT_DIR=$(dirname "$(realpath "$0")")
PROJECT_ROOT=$(realpath "$SCRIPT_DIR/..")

# Build the project
echo "Building the project..."
forge build

# Deploy the EigenLayer contracts
echo "Deploying EigenLayer contracts..."
cd "$PROJECT_ROOT/lib/eigenlayer-middleware/lib/eigenlayer-contracts"
forge script script/deploy/devnet/M2_Deploy_From_Scratch.s.sol --rpc-url $RPC_URL \
--private-key $PRIVATE_KEY --broadcast \
--sig "run(string memory configFile)" -- M2_deploy_from_scratch.anvil.config.json
cd "$PROJECT_ROOT"

# Copy deployment data
echo "Copying deployment data..."
cp "$PROJECT_ROOT/lib/eigenlayer-middleware/lib/eigenlayer-contracts/script/output/devnet/M2_from_scratch_deployment_data.json" "$PROJECT_ROOT/script/output/31337/eigenlayer_deployment_output.json"

# Deploy the AVS contracts
echo "Deploying AVS contracts..."
forge script "$PROJECT_ROOT/script/CredentialVerifierDeployer.s.sol" --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast -v

# Run the operator
echo "Running the operator..."
cd "$PROJECT_ROOT"
npx tsx operator/index.ts

echo "Deployment and run completed successfully."