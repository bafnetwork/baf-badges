#!/bin/sh
RUSTFLAGS='-C link-arg=-s' cd nft && cargo build --target wasm32-unknown-unknown --release
cd ..
RUSTFLAGS='-C link-arg=-s' cd minter && cargo build --target wasm32-unknown-unknown --release
