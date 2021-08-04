import React, { useState, useEffect, ComponentType } from 'react'
import { initContract } from '../utils/init';
import { NotSignedIn } from './NotSignedIn';

export function withNearWallet<P>(Inner: ComponentType<P>) {
  const Wrapped = (props: P) => {
    const [signedIn, setSignedIn] = useState(false);

    useEffect(() => {
      initContract().then(() => {
        setSignedIn(window.walletConnection.isSignedIn())
      })
    }, []);

    return signedIn ? (
      <Inner {...props}/>
    ) : (
      <NotSignedIn/>
    )
  };

  return Wrapped;
}
