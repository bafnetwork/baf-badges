import React, { useState, useEffect, ComponentType } from 'react'
import { initContract, getWalletConnection, AppContract } from '../utils/init';
import { NotSignedIn } from './NotSignedIn';

export function withNearWallet<P>(Inner: ComponentType<P>, contract: AppContract) {
  const Wrapped = (props: P) => {
    const [signedIn, setSignedIn] = useState(false);

    useEffect(() => {
      initContract().then(() => {
        setSignedIn(getWalletConnection(contract).isSignedIn())
      })
    }, []);

    return signedIn ? (
      <Inner {...props}/>
    ) : (
      <NotSignedIn contract={contract} />
    )
  };

  return Wrapped;
}
