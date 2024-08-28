#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Get the directory of the current script
SCRIPT_DIR=$(dirname "$(realpath "$0")")
PROJECT_ROOT=$(realpath "$SCRIPT_DIR/..")

# Copy .env.example to .env
echo "Copying .env.example to .env..."
cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"

# Install dependencies
echo "Installing dependencies..."
cd "$PROJECT_ROOT"
yarn install
forge install

# Navigate to eigenlayer contracts directory and install dependencies
echo "Installing eigenlayer contracts dependencies..."
cd "$PROJECT_ROOT/lib/eigenlayer-middleware/lib/eigenlayer-contracts"
forge install
cd "$PROJECT_ROOT"

echo "Dependencies installed successfully."