#!/bin/sh

# this script deploys an entirely separate contract every time'
# TODO: cheksum the contract source + Cargo.lock + build.sh and skip over this entire script unless it changes
# see https://github.com/bafnetwork/baf-badges/issues/4

echo "redeploying a new instance of the contracts..\n\n"

DEV_ACCOUNT_ID='sladuca3.testnet'

rm -rf neardev 
near dev-deploy ./contracts/nft/target/wasm32-unknown-unknown/release/baf_badges_nft_contract.wasm
NFT_CONTRACT_ID="$(cat neardev/dev-account)"

rm -rf neardev
near dev-deploy ./contracts/minter/target/wasm32-unknown-unknown/release/baf_badges_minter_contract.wasm
MINTER_CONTRACT_ID="$(cat neardev/dev-account)"

echo "{\"nftContractID\": \"$NFT_CONTRACT_ID\", \"minterContractID\": \"$MINTER_CONTRACT_ID\"}" > contract-config.json
near call $NFT_CONTRACT_ID new_default_meta "{ \"owner_id\": \"$MINTER_CONTRACT_ID\" }" --accountId=$DEV_ACCOUNT_ID
near call $MINTER_CONTRACT_ID new "{\"nft_contract_id\": \"$NFT_CONTRACT_ID\"}" --accountId=$DEV_ACCOUNT_ID
