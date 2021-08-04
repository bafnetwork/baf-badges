#!/bin/sh

# this script deploys an entirely separate contract every time'
# TODO: cheksum the contract source + Cargo.lock + build.sh and skip over this entire script unless it changes

echo "deleting neardev and redeploying a new instance of the contract..\n\n"

rm -rf neardev 
near dev-deploy ./contract/target/wasm32-unknown-unknown/release/baf_badges_contract.wasm

echo "{\"contractName\": \"$(cat neardev/dev-account)\"}" > contract-config.json
near call $(cat neardev/dev-account) new_default_meta '{ "owner_id": "sladuca3.testnet" }' --accountId=sladuca3.testnet
