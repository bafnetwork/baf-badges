#!/bin/sh
near dev-deploy target/wasm32-unknown-unknown/release/baf-badges-contract.wasm

echo "{\"contractName\": \"$(cat neardev/dev-account)\"}" > ../config.json
near call $(cat neardev/dev-account) new --accountId=sladuca.testnet
