import { WalletConnection, Contract } from 'near-api-js'

export declare global {
	interface Window {
	  // add you custom properties and methods
	  accountId: any;
	  nftWalletConnection: WalletConnection;
	  minterWalletConnection: WalletConnection;
	  nft_contract: Contract & NftContractMethods;
	  minter_contract: Contract & MinterContractMethods;
	}

	interface NftContractMethods {
		nft_mint?: ContractChangeMethod<MintArgs>
	}

	interface NftContractMethods {
		nft_token?: ContractViewMethod<NFTTokenArgs>;
		nft_tokens_for_owner?: ContractViewMethod<NFTTokensForOwnerArgs>;

		// TODO: add type for TransferArgs
		// see https://github.com/bafnetwork/baf-badges/issues/1
		nft_transfer?: ContractChangeMethod<any>;
	}
}

export type ContractViewMethod<Args> = (args: Args) => Promise<any>;
export type ContractChangeMethod<Args> = (params: ContractChangeMethodParams<Args>) => Promise<any>;

export interface ContractChangeMethodParams<Args> {
	args: Args,
	gas?: string,
	amount?: string
}

export interface NFTTokenArgs {
	token_id: string;
}

/// it must be the case that either both from_index and limit are present or none of them are
export interface NFTTokensForOwnerArgs {
	account_id: string;
	from_index?: number;
	to_index?: number;
}

export interface MintArgs {
	token_id: string;
	token_owner_id: string;
	token_metadata?: any;
}

