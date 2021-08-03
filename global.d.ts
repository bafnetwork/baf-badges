import { WalletConnection, Contract } from 'near-api-js'

export declare global {
	interface Window {
	  // add you custom properties and methods
	  accountId: any;
	  walletConnection: WalletConnection;
	  contract: Contract & ContractMethods;
	}

	interface ContractMethods {
		nft_token?: (args: any) => Promise<any>;
		mint?: (args: any, gas?: number, amount?: number) => Promise<any>;
		nft_transfer?: (args: any, gas?: number, amount?: number) => Promise<any>;
	}
  }
  