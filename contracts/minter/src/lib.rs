use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{
    LazyOption,
    UnorderedMap,
    UnorderedSet
};
use near_sdk::json_types::ValidAccountId;
use near_sdk::{
    env, near_bindgen, AccountId, BorshStorageKey, PanicOnDefault, Promise, PromiseOrValue, ext_contract
};
use near_contract_standards::non_fungible_token::metadata::TokenMetadata;
use near_contract_standards::non_fungible_token::TokenId;

near_sdk::setup_alloc!();

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    Minter 
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    owner: AccountId,
    nft_contract_id: AccountId,
    minters: UnorderedSet<AccountId>,
}

impl Contract {
    fn assert_predecessor_is_minter(&self) {
        let predecessor = env::predecessor_account_id();
        assert!(self.minters.contains(&predecessor), "accountID {} is not an authorized minter", predecessor);
    }

    fn assert_predecessor_is_owner(&self) {
        let predecessor = env::predecessor_account_id();
        assert_eq!(predecessor, self.owner, "accountID {} is not the contract owner", predecessor);
    }
}

#[ext_contract]
pub trait NFTContract {
    fn nft_mint(
        &mut self,
        token_id: TokenId,
        token_owner_id: ValidAccountId,
        token_metadata: TokenMetadata,
    ) -> Token;
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(nft_contract_id: AccountId) -> Contract {
        let mut minters = UnorderedSet::new(StorageKey::Minter);
        minters.insert(&env::predecessor_account_id());
        Contract { owner: env::predecessor_account_id(), nft_contract_id, minters }
    }

    pub fn add_minter(&mut self, minter: String) {
        self.assert_predecessor_is_owner();
        self.minters.insert(&minter);
    }

    pub fn remove_minter(&mut self, minter: String) {
        self.assert_predecessor_is_owner();
        self.minters.remove(&minter);
    }

    #[payable]
    pub fn nft_mint(&mut self, token_id: TokenId, token_owner_id: ValidAccountId, token_metadata: TokenMetadata) -> Promise {
        self.assert_predecessor_is_minter();
        nft_contract::nft_mint(token_id, token_owner_id, token_metadata, &self.nft_contract_id, env::attached_deposit(), env::prepaid_gas() / 2)
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {

}