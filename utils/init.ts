import { connect, Contract, keyStores, WalletConnection } from 'near-api-js'
import { getConfig } from '../config/nearConfig'
import { UnexpectedUIStateError } from './errors';

export enum AppContract {
  NFT,
  Minter
}


export const nearConfig = getConfig(process.env.NODE_ENV || 'development')

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig));

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.nftWalletConnection = new WalletConnection(near, 'baf-badges-nft');
  window.minterWalletConnection = new WalletConnection(near, 'baf-badges-minter ');

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.nftWalletConnection.getAccountId()

  // Initializing our contract APIs by contract name and configuration
  window.nft_contract = await new Contract(
    window.nftWalletConnection.account(),
    nearConfig.nft_contract_id,
    {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: ['nft_token', 'nft_tokens_for_owner'],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: ['nft_transfer'],
    }
  );

  window.minter_contract = await new Contract(
    window.minterWalletConnection.account(),
    nearConfig.minter_contract_id,
    {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: [],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: ['nft_mint'],
    }
  );
}

export function logout() {
  window.nftWalletConnection.signOut()
  window.minterWalletConnection.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}

export function loginNFT() {
  // Allow the current app to make calls to the specified contract ids on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.nftWalletConnection.requestSignIn(nearConfig.nft_contract_id)
}

export function loginMinter() {
  window.minterWalletConnection.requestSignIn(nearConfig.minter_contract_id)
}

export function getWalletConnection(contract: AppContract) {
  switch (contract) {
    case AppContract.NFT:
      return window.nftWalletConnection
    case AppContract.Minter:
      return window.minterWalletConnection
    default:
      throw UnexpectedUIStateError("invalid app contract enum value")
  }
}

export function getLoginFn(contract: AppContract) {
  switch (contract) {
    case AppContract.NFT:
      return loginNFT;
    case AppContract.Minter:
      return loginMinter
    default:
      throw UnexpectedUIStateError("invalid app contract enum value")
  }
}