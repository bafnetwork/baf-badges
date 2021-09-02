import { getLoginFn, AppContract } from '../utils/init';

export interface NotSignedInProps {
  contract: AppContract;
}

export function NotSignedIn({ contract }: NotSignedInProps) {
	return (
		<main>
        <h1>It looks like you&apos;re not signed in.</h1>
        <p>
          Please sign in with NEAR wallet to proceed.
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={getLoginFn(contract)}>Sign in</button>
        </p>
    </main>
	)
}
