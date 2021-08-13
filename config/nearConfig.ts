import contractConfig from '../contract-config.json';

// near-cli calls it "contract Name", but this name is poorly chosen
// it's really referring to the contract's accountID on chain.
const CONTRACT_ACCOUNT_ID = contractConfig.contractName

const MAINNET_CONFIG = {
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  contractName: CONTRACT_ACCOUNT_ID,
  walletUrl: 'https://wallet.near.org',
  helperUrl: 'https://helper.mainnet.near.org',
  explorerUrl: 'https://explorer.mainnet.near.org',
}

const TESTNET_CONFIG = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  contractName: CONTRACT_ACCOUNT_ID,
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
}

const BETANET_CONFIG = {
  networkId: 'betanet',
  nodeUrl: 'https://rpc.betanet.near.org',
  contractName: CONTRACT_ACCOUNT_ID,
  walletUrl: 'https://wallet.betanet.near.org',
  helperUrl: 'https://helper.betanet.near.org',
  explorerUrl: 'https://explorer.betanet.near.org',
}

// ! localnet is disabled right now due to the fact that it 
// ! requires getting the home dir and we don't have a 
// ! straightforward way to get that
// TODO: (low priority) figure out a way to dynamically load this env var in `next dev`
// see https://github.com/bafnetwork/baf-badges/issues/3
// const LOCALNET_CONFIG = {
//   networkId: 'local',
//   nodeUrl: 'http://localhost:3030',
//   keyPath: `${process.env.HOME}/.near/validator_key.json`,
//   walletUrl: 'http://localhost:4000/wallet',
//   contractName: CONTRACT_ACCOUNT_ID,
// }

const CI_CONFIG = {
  networkId: 'shared-test',
  nodeUrl: 'https://rpc.ci-testnet.near.org',
  contractName: CONTRACT_ACCOUNT_ID,
  masterAccount: 'test.near',
}

const CI_BETANET_CONFIG = {
  networkId: 'shared-test-staging',
  nodeUrl: 'https://rpc.ci-betanet.near.org',
  contractName: CONTRACT_ACCOUNT_ID,
  masterAccount: 'test.near',
}

export function getConfig(env: string) {
  switch (env) {
    case 'mainnet':
      return MAINNET_CONFIG
    case 'production':
    case 'development':
    case 'testnet':
      return TESTNET_CONFIG;
    case 'betanet':
      return BETANET_CONFIG;
    // ! Disabled for now. See Above.
    // case 'local':
    //   return LOCALNET_CONFIG
    case 'test':
    case 'ci':
      return CI_CONFIG;
    case 'ci-betanet':
      return CI_BETANET_CONFIG;
    default:
      throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`)
  }
}
